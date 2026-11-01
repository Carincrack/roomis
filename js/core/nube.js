/* =========================================================================
   NUBE · Supabase (Auth + base de datos + Realtime)
   - Sesión real con correo y contraseña.
   - Las pantallas mutan S como siempre. Tras cada acción, sincronizar()
     compara S con lo último guardado y sube solo lo que cambió.
   - Los cambios del resto del hogar llegan por Realtime y se aplican sobre
     los mismos objetos de S (así «Deshacer» sigue funcionando).
   - Presencia (quién está en línea) y «está escribiendo» viajan por el canal.
   ========================================================================= */
const NUBE = {
  estado: 'local',            // local · conectando · en-vivo · error
  cliente: null, canal: null, canalPropio: null,
  sesion: null,
  lista: false,               // true cuando S ya refleja la base del hogar
  listo: false,               // true cuando ya se revisó la sesión al arrancar
  ultimo: {},
  enLinea: new Set(),
  escribiendo: {},
  renderPendiente: false,
};

const aIso = d => new Date(d).toISOString();
/* Nombres escritos por usuarios: se quitan caracteres de HTML para poder pintarlos sin riesgo */
const limpio = v => String(v ?? '').replace(/[<>&"'`]/g, '');
const hid = () => S.hogar.id;

/* ---------- Colecciones: cómo pasar de S a filas y de filas a S ---------- */
const COLECCIONES = {
  hogares: {
    modo: 'update', clave: 'id',
    filas: () => hid() ? [{ id: hid(), nombre: S.hogar.nombre, ubicacion: S.hogar.ubicacion, integrantes: S.hogar.integrantes, reglas: S.hogar.reglas }] : [],
    aplicar: f => { Object.assign(S.hogar, { nombre: limpio(f.nombre), ubicacion: limpio(f.ubicacion), codigo: f.codigo ?? S.hogar.codigo, integrantes: f.integrantes, admin: f.admin ?? S.hogar.admin }); Object.assign(S.hogar.reglas, f.reglas); },
    quitar: () => expulsado('El hogar fue eliminado'),
  },
  miembros: {
    modo: 'update', clave: 'perfil_id',
    filas: () => [
      ...S.miembros.map(id => ({ perfil_id: id, rol: S.roles[id] || 'miembro', estado: 'activo' })),
      ...S.solicitudes.map(s => ({ perfil_id: s.id, rol: 'miembro', estado: 'pendiente' })),
    ],
    aplicar: f => {
      const id = f.perfil_id; S.roles[id] = f.rol;
      if (f.estado === 'activo') { S.solicitudes = S.solicitudes.filter(s => s.id !== id); if (!S.miembros.includes(id)) S.miembros.push(id); }
      else { S.miembros = S.miembros.filter(m => m !== id); if (!S.solicitudes.some(s => s.id === id)) S.solicitudes.push({ id, creado: new Date(f.creado || Date.now()) }); }
      if (!S.personas[id]) cargarPerfiles([id]);
    },
    quitar: id => {
      if (id === S.yo) return expulsado('Ya no formas parte de este hogar');
      S.miembros = S.miembros.filter(m => m !== id); S.solicitudes = S.solicitudes.filter(s => s.id !== id);
    },
  },
  tareas: lista('tareas', t => ({ id: t.id, hogar_id: hid(), titulo: t.titulo, lugar: t.lugar || 'Casa', asignado: t.asignado, por: t.por, vence: aIso(t.vence),
                                   estado: t.estado, repite: !!t.repite, alertas: t.alertas || [], avisar: !!t.avisar }),
                          f => ({ id: f.id, titulo: f.titulo, lugar: f.lugar, asignado: f.asignado, por: f.por, vence: new Date(f.vence),
                                   estado: f.estado, repite: f.repite, alertas: [...f.alertas], avisar: f.avisar })),
  gastos: lista('gastos', g => ({ id: g.id, hogar_id: hid(), titulo: g.titulo, cat: g.cat, monto: Math.round(g.monto), pago: g.pago, entre: g.entre, pagados: g.pagados, fecha: aIso(g.fecha) }),
                          f => ({ id: f.id, titulo: f.titulo, cat: f.cat, monto: Number(f.monto), pago: f.pago, entre: [...f.entre], pagados: [...f.pagados], fecha: new Date(f.fecha) })),
  avisos: lista('avisos', a => ({ id: a.id, hogar_id: hid(), cat: a.cat, tipo: a.tipo, tarea: a.tarea ?? null, gasto: a.gasto ?? null, persona: a.persona ?? null, hora: aIso(a.hora) }),
                          f => { const a = { id: f.id, cat: f.cat, tipo: f.tipo, hora: new Date(f.hora) }; ['tarea', 'gasto', 'persona'].forEach(k => { if (f[k]) a[k] = f[k]; }); return a; },
                          (x, y) => y.hora - x.hora),
  mensajes: lista('mensajes', m => ({ id: m.id, hogar_id: hid(), autor: m.autor, texto: m.texto, creado: aIso(m.creado) }),
                              f => ({ id: f.id, autor: f.autor, texto: f.texto, creado: new Date(f.creado) }),
                              (x, y) => x.creado - y.creado, 'insert'),
};
const ORDEN = ['hogares', 'miembros', 'tareas', 'gastos', 'avisos', 'mensajes'];

function lista(tabla, aFila, deFila, orden, modo = 'upsert') {
  return {
    modo, clave: 'id',
    filas: () => S[tabla].map(aFila),
    aplicar: f => {
      const o = deFila(f), ex = S[tabla].find(x => x.id === f.id);
      if (ex) { Object.keys(ex).forEach(k => { if (!(k in o)) delete ex[k]; }); Object.assign(ex, o); } else S[tabla].push(o);
      if (orden) S[tabla].sort(orden);
    },
    quitar: id => { S[tabla] = S[tabla].filter(x => x.id !== id); },
    reemplazar: filas => { S[tabla] = filas.map(deFila); if (orden) S[tabla].sort(orden); },
  };
}
const claveDe = (col, f) => f[COLECCIONES[col].clave];
const mapaFilas = col => new Map(COLECCIONES[col].filas().map(f => [claveDe(col, f), JSON.stringify(f)]));
const filaLocal = (col, id) => COLECCIONES[col].filas().find(f => claveDe(col, f) === id);

/* ---------- Subir cambios locales ---------- */
let timerSync = null, cola = Promise.resolve();
function programarSync() { if (!NUBE.lista) return; clearTimeout(timerSync); timerSync = setTimeout(() => { cola = cola.then(sincronizar); }, 120); }

async function sincronizar() {
  if (!NUBE.lista || !NUBE.cliente || !hid()) return;
  const cambios = ORDEN.map(col => {
    const actual = mapaFilas(col), previo = NUBE.ultimo[col] || new Map();
    const subir = [...actual].filter(([id, j]) => previo.has(id) ? previo.get(id) !== j : true).map(([id, j]) => ({ nueva: !previo.has(id), fila: JSON.parse(j) }));
    const borrar = [...previo.keys()].filter(id => !actual.has(id));
    NUBE.ultimo[col] = actual;
    return { col, subir, borrar, previo };
  });
  try {
    for (const c of cambios) {
      const C = COLECCIONES[c.col], db = () => NUBE.cliente.from(c.col);
      if (!c.subir.length) continue;
      if (C.modo === 'upsert') { const { error } = await db().upsert(c.subir.map(x => x.fila)); if (error) throw error; }
      if (C.modo === 'insert') { const nuevas = c.subir.filter(x => x.nueva).map(x => x.fila); if (nuevas.length) { const { error } = await db().insert(nuevas); if (error) throw error; } }
      if (C.modo === 'update') for (const { fila } of c.subir) {
        const { [C.clave]: k, ...resto } = fila;
        let q = db().update(resto).eq(C.clave, k); if (c.col === 'miembros') q = q.eq('hogar_id', hid());
        const { error } = await q; if (error) throw error;
      }
    }
    for (const c of [...cambios].reverse()) {
      if (!c.borrar.length || c.col === 'hogares') continue;
      const C = COLECCIONES[c.col];
      let q = NUBE.cliente.from(c.col).delete().in(C.clave, c.borrar); if (c.col === 'miembros') q = q.eq('hogar_id', hid());
      const { error } = await q; if (error) throw error;
    }
    if (NUBE.estado === 'error') ponerEstado('en-vivo');
  } catch (e) {
    console.error('[nube] no se pudo guardar', e);
    cambios.forEach(c => { NUBE.ultimo[c.col] = c.previo; });
    ponerEstado('error');
    aviso(e.code === '42501' ? 'No tienes permiso para ese cambio.' : 'No se pudo guardar. Revisa tu conexión e inténtalo de nuevo.', 'peligro');
  }
}

/* ---------- Recibir cambios del resto del hogar ---------- */
function alCambiar(payload) {
  const col = payload.table, C = COLECCIONES[col]; if (!C || !NUBE.lista) return;
  const fila = payload.eventType === 'DELETE' ? payload.old : payload.new;
  if (fila.hogar_id && fila.hogar_id !== hid()) return;
  const id = claveDe(col, fila); if (!id) return;
  const antes = JSON.stringify(filaLocal(col, id) ?? null);
  if (payload.eventType === 'DELETE') C.quitar(id); else C.aplicar(payload.new);
  if (!NUBE.lista) return;                                   // nos sacaron del hogar
  const despues = filaLocal(col, id);
  if (despues) NUBE.ultimo[col].set(id, JSON.stringify(despues)); else NUBE.ultimo[col].delete(id);
  if (antes === JSON.stringify(despues ?? null)) return;    // eco de un cambio propio

  if (payload.eventType === 'INSERT') notificarNuevo(col, payload.new);
  if (col === 'mensajes' && typeof chatRecibido === 'function' && chatRecibido()) return;
  pedirRender();
}

function notificarNuevo(col, f) {
  if (col === 'mensajes' && f.autor !== S.yo) {
    delete NUBE.escribiendo[f.autor];
    if (!location.hash.startsWith('#/chat')) { S.chatSinLeer++; aviso(`<strong class="font-semibold">${esc(persona(f.autor).corto)}:</strong> ${esc(f.texto.slice(0, 70))}`); }
  }
  if (col === 'tareas' && f.asignado === S.yo && f.por !== S.yo) aviso(`${esc(persona(f.por).corto)} te asignó “${esc(f.titulo)}”`, 'alerta');
  if (col === 'avisos') S.sinLeer = true;
  if (col === 'avisos' && f.tipo === 'nfc' && f.persona !== S.yo) {
    const t = tarea(f.tarea);
    if (t) aviso(`${esc(persona(f.persona).corto)} marcó “${esc(t.titulo)}” con la etiqueta${lugarPorNombre(t.lugar) ? ' ' + delLugar(lugarPorNombre(t.lugar)) : ''}`);
  }
  if (col === 'miembros' && f.estado === 'pendiente' && soyAdmin()) aviso(`${esc(persona(f.perfil_id).corto)} quiere unirse al hogar`, 'alerta');
}

/* Repinta sin interrumpir: si estás escribiendo o hay un diálogo abierto, espera */
function pedirRender() {
  const a = document.activeElement, ocupado = (a && a.matches('input, textarea, select')) || document.getElementById('capa-modal').innerHTML;
  if (ocupado) { NUBE.renderPendiente = true; return; }
  NUBE.renderPendiente = false; refrescar();
}
document.addEventListener('focusout', () => setTimeout(() => { if (NUBE.renderPendiente) pedirRender(); }, 0));

/* ---------- Indicador de conexión ---------- */
function ponerEstado(e) {
  NUBE.estado = e;
  document.querySelectorAll('[data-estado-nube]').forEach(el => { el.outerHTML = pildoraNube(el.dataset.estadoNube); });
}
function pildoraNube(variante = '') {
  const m = { 'en-vivo': ['bg-acento-teal', 'En vivo'], conectando: ['bg-alerta animate-pulse', 'Conectando…'], error: ['bg-peligro', 'Sin conexión'], local: ['bg-texto/40', 'Sin configurar'] }[NUBE.estado];
  return `<span data-estado-nube="${variante}" class="inline-flex items-center gap-1.5 text-[12px] font-medium leading-4 tenue"><span class="size-2 rounded-full ${m[0]}" aria-hidden="true"></span>${m[1]}</span>`;
}

/* ---------- Presencia y «escribiendo» ---------- */
function anunciarPresencia() { if (NUBE.canal && NUBE.estado === 'en-vivo') NUBE.canal.track({ yo: S.yo, desde: Date.now() }); }
let ultimoEscribiendo = 0;
function anunciarEscribiendo() {
  if (!NUBE.canal || Date.now() - ultimoEscribiendo < 1500) return;
  ultimoEscribiendo = Date.now();
  NUBE.canal.send({ type: 'broadcast', event: 'escribiendo', payload: { yo: S.yo } });
}

/* ---------- Carga de datos ---------- */
async function cargarPerfiles(ids) {
  const faltan = ids.filter(id => id && !S.personas[id]); if (!faltan.length) return;
  const { data, error } = await NUBE.cliente.from('perfiles').select('id, nombre, corto, ini, color').in('id', faltan);
  if (error) return console.error('[nube] perfiles', error);
  data.forEach(p => { S.personas[p.id] = { nombre: limpio(p.nombre), corto: limpio(p.corto), ini: limpio(p.ini), color: /^#[0-9A-F]{6}$/i.test(p.color) ? p.color : '#CFE0C3' }; });
  if (NUBE.lista) pedirRender();
}

/* Revisa a qué hogar pertenezco y carga todo. Devuelve la ruta a la que conviene ir. */
async function cargarUsuario() {
  const db = NUBE.cliente, yo = NUBE.sesion.user.id;
  S.yo = yo;
  await cargarPerfiles([yo]);
  const { data: filas, error } = await db.from('miembros').select('*').eq('perfil_id', yo).limit(1);
  if (error) throw error;
  const fila = filas[0];
  escucharMiFila(yo);
  if (!fila) { S.miEstado = null; return '#/bienvenida'; }
  if (fila.estado === 'pendiente') {
    S.miEstado = 'pendiente'; S.solicitudEnviada = new Date(fila.creado);
    const { data: h } = await db.from('hogares').select('id, nombre, codigo').eq('id', fila.hogar_id).single();
    if (h) { const { data: b } = await db.rpc('buscar_hogar', { p_codigo: h.codigo }); S.hogarBuscado = (b && b[0]) ? { ...b[0], nombre: limpio(b[0].nombre), admin_nombre: limpio(b[0].admin_nombre), iniciales: (b[0].iniciales || []).map(limpio) } : { ...h, nombre: limpio(h.nombre), miembros: 0, iniciales: [] }; }
    return '#/esperando';
  }
  await cargarHogar(fila.hogar_id);
  return '#/inicio';
}

async function cargarHogar(hogarId) {
  const db = NUBE.cliente;
  const [h, m, t, g, a, msj] = await Promise.all([
    db.from('hogares').select('*').eq('id', hogarId).single(),
    db.from('miembros').select('*').eq('hogar_id', hogarId),
    db.from('tareas').select('*').eq('hogar_id', hogarId),
    db.from('gastos').select('*').eq('hogar_id', hogarId),
    db.from('avisos').select('*').eq('hogar_id', hogarId).order('hora', { ascending: false }).limit(100),
    db.from('mensajes').select('*').eq('hogar_id', hogarId).order('creado', { ascending: false }).limit(300),
  ]);
  const fallo = [h, m, t, g, a, msj].find(r => r.error); if (fallo) throw fallo.error;
  S.hogar = { ...hogarVacio(), ...h.data, nombre: limpio(h.data.nombre), ubicacion: limpio(h.data.ubicacion), reglas: { ...hogarVacio().reglas, ...h.data.reglas } };
  S.miEstado = 'activo';
  S.roles = {}; S.miembros = []; S.solicitudes = [];
  m.data.sort((x, y) => new Date(x.creado) - new Date(y.creado)).forEach(f => {
    S.roles[f.perfil_id] = f.rol;
    if (f.estado === 'activo') S.miembros.push(f.perfil_id); else S.solicitudes.push({ id: f.perfil_id, creado: new Date(f.creado) });
  });
  await cargarPerfiles(m.data.map(f => f.perfil_id));
  COLECCIONES.tareas.reemplazar(t.data);
  COLECCIONES.gastos.reemplazar(g.data);
  COLECCIONES.avisos.reemplazar(a.data);
  COLECCIONES.mensajes.reemplazar(msj.data);
  S.sinLeer = S.avisos.some(x => x.hora > leidoHasta());
  ORDEN.forEach(col => { NUBE.ultimo[col] = mapaFilas(col); });
  NUBE.lista = true;
  suscribirHogar();
}

const leidoHasta = () => { try { return Number(localStorage.getItem('roomies:leido:' + S.yo)) || 0; } catch { return 0; } };
function marcarLeido() { try { localStorage.setItem('roomies:leido:' + S.yo, String(Date.now())); } catch {} }

/* ---------- Canales en tiempo real ---------- */
function suscribirHogar() {
  if (NUBE.canal) NUBE.cliente.removeChannel(NUBE.canal);
  const id = hid();
  NUBE.canal = NUBE.cliente.channel('hogar:' + id, { config: { presence: { key: S.yo } } });
  NUBE.canal.on('postgres_changes', { event: '*', schema: 'public', table: 'hogares', filter: 'id=eq.' + id }, alCambiar);
  ['miembros', 'tareas', 'gastos', 'avisos', 'mensajes'].forEach(tabla =>
    NUBE.canal.on('postgres_changes', { event: '*', schema: 'public', table: tabla, filter: 'hogar_id=eq.' + id }, alCambiar));
  // Los borrados no se pueden filtrar por columna: llegan aparte y se ignoran si no son de este hogar
  ['tareas', 'gastos', 'avisos', 'mensajes', 'miembros'].forEach(tabla =>
    NUBE.canal.on('postgres_changes', { event: 'DELETE', schema: 'public', table: tabla }, alCambiar));
  NUBE.canal
    .on('presence', { event: 'sync' }, () => {
      NUBE.enLinea = new Set(Object.values(NUBE.canal.presenceState()).flat().map(p => p.yo));
      if (typeof chatPresencia === 'function') chatPresencia();
    })
    .on('broadcast', { event: 'escribiendo' }, ({ payload }) => {
      if (payload.yo === S.yo) return;
      NUBE.escribiendo[payload.yo] = Date.now();
      if (typeof chatPresencia === 'function') chatPresencia();
      setTimeout(() => { if (Date.now() - (NUBE.escribiendo[payload.yo] || 0) >= 3000) { delete NUBE.escribiendo[payload.yo]; if (typeof chatPresencia === 'function') chatPresencia(); } }, 3100);
    })
    .subscribe(e => {
      if (e === 'SUBSCRIBED') { ponerEstado('en-vivo'); anunciarPresencia(); }
      if (e === 'CHANNEL_ERROR' || e === 'TIMED_OUT') ponerEstado('error');
    });
}

/* Mi propia fila de miembro: me aceptan, me rechazan o me sacan */
function escucharMiFila(yo) {
  if (NUBE.canalPropio) NUBE.cliente.removeChannel(NUBE.canalPropio);
  NUBE.canalPropio = NUBE.cliente.channel('yo:' + yo)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'miembros', filter: 'perfil_id=eq.' + yo }, async p => {
      if (p.eventType === 'UPDATE' && p.new.estado === 'activo' && S.miEstado === 'pendiente') {
        await cargarHogar(p.new.hogar_id);
        ir('#/inicio'); aviso(`¡Te aceptaron en ${esc(S.hogar.nombre)}!`);
      }
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'miembros' }, p => {
      if (p.old.perfil_id !== yo) return;
      if (S.miEstado === 'pendiente') { S.miEstado = null; S.hogarBuscado = null; ir('#/crear-o-unirse'); aviso('El administrador rechazó tu solicitud', 'peligro'); }
    })
    .subscribe();
}

function expulsado(msg) {
  dejarHogar();
  ir('#/crear-o-unirse'); aviso(msg, 'alerta');
}
function dejarHogar() {
  if (NUBE.canal) NUBE.cliente.removeChannel(NUBE.canal);
  NUBE.canal = null; NUBE.lista = false; NUBE.ultimo = {};
  const { yo, personas, testimonio } = S;
  reiniciarEstado(); Object.assign(S, { yo, personas: { [yo]: personas[yo] }, testimonio });
}

/* ---------- Acciones de cuenta y hogar ---------- */
const AUTH = {
  async entrar(correo, clave) {
    const { data, error } = await NUBE.cliente.auth.signInWithPassword({ email: correo, password: clave });
    if (error) throw error;
    NUBE.sesion = data.session;
    return cargarUsuario();
  },
  async registrar(nombre, correo, clave) {
    // 1) Sin correos: la función registrar_cuenta crea la cuenta ya confirmada y se entra de una vez
    const c = correo.trim().toLowerCase();
    const { error: e1 } = await NUBE.cliente.rpc('registrar_cuenta', { p_nombre: nombre, p_correo: c, p_clave: clave });
    if (!e1) return AUTH.entrar(c, clave);
    if (!/registrar_cuenta|PGRST202|schema cache/i.test(e1.message + (e1.code || ''))) throw e1;
    // 2) Si la función aún no está en la base: registro normal de Supabase Auth
    const { data, error } = await NUBE.cliente.auth.signUp({ email: c, password: clave, options: { data: { nombre } } });
    if (error) throw error;
    if (!data.session) throw new Error('confirmar-correo');
    NUBE.sesion = data.session;
    return cargarUsuario();
  },
  async salir() {
    await NUBE.cliente.auth.signOut();
    if (NUBE.canalPropio) NUBE.cliente.removeChannel(NUBE.canalPropio);
    dejarHogar(); NUBE.sesion = null; reiniciarEstado();
  },
  async crearHogar(nombre, integrantes, reglas) {
    const { data, error } = await NUBE.cliente.rpc('crear_hogar', { p_nombre: nombre, p_integrantes: integrantes, p_reglas: reglas });
    if (error) throw error;
    await cargarHogar(data.id);
  },
  async buscar(codigo) {
    const { data, error } = await NUBE.cliente.rpc('buscar_hogar', { p_codigo: codigo });
    if (error) throw error;
    const h = data[0]; if (!h) return null;
    return { ...h, nombre: limpio(h.nombre), ubicacion: limpio(h.ubicacion), admin_nombre: limpio(h.admin_nombre), iniciales: (h.iniciales || []).map(limpio) };
  },
  async unirse(codigo) {
    const { data, error } = await NUBE.cliente.rpc('solicitar_unirse', { p_codigo: codigo });
    if (error) throw error;
    if (data === 'activo') { const { data: f } = await NUBE.cliente.from('miembros').select('hogar_id').eq('perfil_id', S.yo).single(); await cargarHogar(f.hogar_id); }
    else { S.miEstado = 'pendiente'; S.solicitudEnviada = new Date(); }
    return data;
  },
  async cancelarSolicitud() {
    const { error } = await NUBE.cliente.from('miembros').delete().eq('perfil_id', S.yo).eq('estado', 'pendiente');
    if (error) throw error;
    S.miEstado = null; S.hogarBuscado = null; S.solicitudEnviada = null;
  },
};

/* Traduce los errores de Supabase a mensajes claros */
function mensajeError(e) {
  const m = (e && (e.message || e.error_description)) || '';
  if (/Invalid login credentials/i.test(m)) return 'Correo o contraseña incorrectos.';
  if (/Email not confirmed|confirmar-correo/i.test(m)) return 'Esta cuenta todavía no está activada. Pide al administrador del proyecto que corra supabase/registro-sin-correo.sql.';
  if (/email rate limit/i.test(m)) return 'Supabase no deja enviar más correos por ahora. Pide al administrador que corra supabase/registro-sin-correo.sql.';
  if (/already registered|already been registered/i.test(m)) return 'Ya existe una cuenta con ese correo. Inicia sesión.';
  if (/Password should be/i.test(m)) return 'La contraseña es muy corta (mínimo 8 caracteres).';
  if (/Correo no válido/i.test(m)) return 'Ese correo no parece válido. Revisa que tenga @ y un dominio.';
  if (/Nombre no válido/i.test(m)) return 'Usa solo letras y espacios en tu nombre (2 a 60 caracteres).';
  if (/rate limit/i.test(m)) return 'Demasiados intentos. Espera un momento.';
  if (/Failed to fetch|NetworkError/i.test(m)) return 'Sin conexión con el servidor.';
  return m || 'Algo salió mal. Inténtalo de nuevo.';
}

/* ---------- Arranque ---------- */
async function iniciarNube() {
  if (!SUPABASE_CONFIG.clave || !window.supabase) { ponerEstado('local'); NUBE.listo = true; refrescar(); return; }
  ponerEstado('conectando');
  NUBE.cliente = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.clave);
  try {
    const { data } = await NUBE.cliente.auth.getSession();
    NUBE.sesion = data.session;
    if (NUBE.sesion) await cargarUsuario();      // el router decide a qué pantalla ir según el estado
    if (!NUBE.canal) ponerEstado('en-vivo');
  } catch (e) {
    console.error('[nube] arranque', e);
    ponerEstado('error');
    aviso(mensajeError(e), 'peligro');
  }
  NUBE.listo = true;
  refrescar();
}
