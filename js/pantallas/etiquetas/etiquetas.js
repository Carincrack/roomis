/* ---------- Etiquetas NFC · computación ubicua ----------
   Cada lugar de la casa lleva una etiqueta NFC que guarda solo un enlace a #/nfc/<lugar>.
   Al acercar el teléfono, Android o iPhone abren Roomies directo en ese lugar, sin buscar
   la tarea en la app. Sin etiquetas a mano, «Simular toque» recrea el mismo gesto. */
const LUGARES = [
  { id: 'cocina',     nombre: 'Cocina',     art: 'la', icono: 'olla',     ejemplo: 'Lavar los platos' },
  { id: 'bano',       nombre: 'Baño',       art: 'el', icono: 'ducha',    ejemplo: 'Limpiar el baño' },
  { id: 'sala',       nombre: 'Sala',       art: 'la', icono: 'sofa',     ejemplo: 'Barrer la sala' },
  { id: 'lavanderia', nombre: 'Lavandería', art: 'la', icono: 'lavadora', ejemplo: 'Tender la ropa' },
  { id: 'basurero',   nombre: 'Basurero',   art: 'el', icono: 'papelera', ejemplo: 'Sacar la basura' },
  { id: 'patio',      nombre: 'Patio',      art: 'el', icono: 'hoja',     ejemplo: 'Regar las plantas' },
];
const lugarDe = id => LUGARES.find(l => l.id === id);
const lugarPorNombre = n => LUGARES.find(l => l.nombre === n);
const enLugar = l => `${l.art === 'el' ? 'en el' : 'en la'} ${l.nombre.toLowerCase()}`;
const delLugar = l => `${l.art === 'el' ? 'del' : 'de la'} ${l.nombre.toLowerCase()}`;
const tareasEn = l => S.tareas.filter(t => t.lugar === l.nombre);
const NFC_REAL = 'NDEFReader' in window;          // Web NFC: Chrome en Android, con HTTPS
const urlEtiqueta = l => `${location.origin}${location.pathname}#/nfc/${l.id}?nfc=1`;
const enlacePublico = () => location.protocol === 'https:' && !/^(localhost|127\.)/.test(location.hostname);
function nfcRapido() { try { return localStorage.getItem('roomies:nfc-rapido') === '1'; } catch { return false; } }

/* Teléfono que se acerca a la etiqueta; las ondas confirman la lectura */
function escenaNfc(l, modo = 'acercar', alto = 150) {
  const onda = n => `<span class="nfc-onda ${n ? 'nfc-onda-' + n : ''} absolute bottom-3 left-[calc(50%-37px)] size-[74px] rounded-[22px] border-2 border-acento-teal"></span>`;
  return `
    <div class="nfc-escena ${modo === 'acercar' ? '' : 'nfc-' + modo} relative mx-auto w-[220px] shrink-0" style="height:${alto}px" aria-hidden="true">
      ${onda()}${onda(2)}${onda(3)}
      <span class="absolute bottom-3 left-[calc(50%-37px)] grid size-[74px] place-items-center rounded-[22px] border border-acento-tea/30 bg-acento-fondo text-acento-tea shadow-vidrio">${ic(l.icono, 'size-8', 1.6)}</span>
      <span class="nfc-telefono absolute left-[calc(50%+6px)] top-0 grid h-[92px] w-[54px] place-items-center rounded-[14px] border-[2.5px] border-texto/70 bg-fondo-bottom text-acento-tea shadow-vidrio">${ic('nfc', 'size-6', 2)}</span>
    </div>`;
}

P.etiquetas = () => {
  const rapido = nfcRapido();
  const tarjeta = l => {
    const pend = tareasEn(l).filter(t => t.estado !== 'completada'), mias = pend.filter(t => t.asignado === S.yo).length;
    return `
      <article class="flex flex-col gap-3 rounded-[22px] border border-texto/[0.14] capa p-3.5">
        <div class="flex items-center gap-3">
          <span class="burbuja size-11">${ic(l.icono, 'size-5')}</span>
          <div class="flex min-w-0 flex-1 flex-col">
            <h2 class="text-[16px] font-semibold leading-[22px]">${l.nombre}</h2>
            <p class="truncate text-[13px] leading-[18px] ${pend.length ? 'text-alerta' : 'tenue'}">${pend.length ? `${pend.length} pendiente${pend.length > 1 ? 's' : ''}${mias ? ` · ${mias} tuya${mias > 1 ? 's' : ''}` : ''}` : 'Todo al día'}</p>
          </div>
        </div>
        <div class="flex gap-2">
          <button type="button" data-accion="nfc-simular" data-id="${l.id}" class="btn-acento flex-1 text-[13px]">${ic('nfc', 'size-4', 2)}Simular toque</button>
          <button type="button" data-accion="${NFC_REAL ? 'nfc-grabar' : 'nfc-copiar'}" data-id="${l.id}" aria-label="${NFC_REAL ? 'Grabar la etiqueta' : 'Copiar el enlace de la etiqueta'} ${delLugar(l)}" class="btn-sec w-11 shrink-0 !px-0">${ic(NFC_REAL ? 'editar' : 'copiar', 'size-[17px]')}</button>
        </div>
      </article>`;
  };
  return {
    ancho: ANCHO.app,
    html: `
      ${encabezado({ titulo: 'Etiquetas NFC', izq: atras('#/perfil'), der: { icono: 'ayuda', etiqueta: 'Cómo funcionan las etiquetas', accion: 'ayuda', id: 'nfc' } })}
      <div class="flex flex-col gap-3.5 lg:grid lg:grid-cols-[400px_minmax(0,1fr)] lg:items-start lg:gap-10">
        <div class="flex flex-col gap-3.5">
          <section class="vidrio-fuerte flex flex-col items-center gap-2 overflow-hidden rounded-[28px] px-5 pb-5 pt-4 text-center">
            ${escenaNfc(LUGARES[0], 'quieto', 132)}
            <h2 class="h2">Toca y listo</h2>
            <p class="text-[14px] leading-5 sec">Pega una etiqueta en cada lugar de la casa. Al acercar el teléfono, Roomies abre lo que toca hacer ahí y lo marcas con un toque.</p>
            ${NFC_REAL
              ? `<button type="button" data-accion="nfc-leer" class="btn-primario mt-2 !h-12 text-[15px]">${ic('nfc', 'size-5', 2)}Leer una etiqueta</button>`
              : `<p class="mt-1 flex items-start gap-2 rounded-2xl bg-acento-fondo px-3.5 py-2.5 text-left text-[13px] leading-[18px] text-texto">${ic('telefono', 'size-4 mt-px text-acento-tea')}Este navegador no lee NFC. Usa «Simular toque» o abre Roomies en Chrome para Android.</p>`}
          </section>
          <div class="flex items-center gap-3 rounded-[20px] border border-texto/[0.14] capa px-4 py-3.5">
            <span class="burbuja size-[34px]">${ic('rayo', 'size-4')}</span>
            <div class="flex min-w-0 flex-1 flex-col gap-px">
              <p class="text-[15px] font-medium leading-[22px]">Marcar al tocar</p>
              <p class="text-[13px] leading-[18px] tenue">Si solo tienes una tarea en ese lugar, se marca de una vez y puedes deshacerla.</p>
            </div>
            ${interruptor(rapido, 'nfc-rapido', 'Marcar al tocar')}
          </div>
          <p class="flex items-start gap-2 px-1 text-[12px] leading-4 tenue">${ic('escudo', 'size-4 shrink-0')}La etiqueta guarda solo el enlace del lugar. No guarda nombres, ubicación ni datos del hogar, y sin tu sesión no muestra nada.</p>
        </div>
        <section class="flex flex-col gap-3" aria-labelledby="lugares-t">
          <p id="lugares-t" class="micro tenue px-1">Lugares de la casa</p>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">${LUGARES.map(tarjeta).join('')}</div>
          ${enlacePublico() ? '' : `<p class="px-1 text-[12px] leading-4 tenue">Para grabar etiquetas reales, Roomies debe estar publicado en internet (por ejemplo, en GitHub Pages). El enlace de esta copia solo funciona en esta computadora.</p>`}
        </section>
      </div>`,
  };
};

/* Lo que se ve al tocar una etiqueta: las tareas de ese lugar, primero las tuyas */
P.nfc = (q, id) => {
  const l = lugarDe(id);
  if (!l) { setTimeout(() => aviso('Esa etiqueta no es de Roomies', 'alerta')); return P.etiquetas(q); }
  const toque = !!S.nfcToque || q.has('nfc');
  S.nfcToque = null;
  if (q.has('nfc')) history.replaceState(null, '', '#/nfc/' + l.id);
  const todas = tareasEn(l), pend = todas.filter(t => t.estado !== 'completada').sort((a, b) => a.vence - b.vence);
  const mias = pend.filter(t => t.asignado === S.yo), otras = pend.filter(t => t.asignado !== S.yo);
  const hechas = todas.filter(t => t.estado === 'completada').slice(-3).reverse();
  const auto = toque && nfcRapido() && mias.length === 1 ? mias[0] : null;

  const mia = t => `
    <article class="flex flex-col gap-3 rounded-[22px] border ${vencida(t) ? 'border-peligro/45' : 'border-texto/[0.14]'} capa-fuerte p-4">
      <a href="#/tarea/${t.id}" class="flex min-w-0 flex-col gap-1.5 rounded-lg">
        <span class="text-[17px] font-semibold leading-6">${esc(t.titulo)}</span>
        <span class="flex items-center gap-2">${chipVence(t)}<span class="text-[13px] tenue">Asignada a ti</span></span>
      </a>
      <button type="button" data-accion="nfc-completar" data-id="${t.id}" class="btn-primario !h-12 text-[15px]">${ic('check', 'size-5', 2.2)}Marcar como hecha</button>
    </article>`;
  const otra = t => `
    <article class="flex items-center gap-3 rounded-[20px] border border-texto/[0.14] capa p-3.5">
      ${avatar(t.asignado, 34, 12)}
      <a href="#/tarea/${t.id}" class="flex min-w-0 flex-1 flex-col gap-0.5 rounded-lg">
        <span class="truncate text-[15px] font-semibold leading-[22px]">${esc(t.titulo)}</span>
        <span class="truncate text-[13px] leading-[18px] tenue">Le toca a ${esc(persona(t.asignado).corto)} · ${diaPalabra(t.vence)}</span>
      </a>
      <button type="button" data-accion="nfc-completar" data-id="${t.id}" aria-label="La hice yo: ${esc(t.titulo)}" class="btn-sec shrink-0">La hice yo</button>
    </article>`;
  const hecha = (t, i) => `${i ? '<div class="divisor"></div>' : ''}
    <a href="#/tarea/${t.id}" class="flex items-center gap-3 rounded-xl transition hover:opacity-80">
      <span class="grid size-[26px] shrink-0 place-items-center rounded-full bg-acento-tea text-sobre">${ic('check', 'size-3.5', 2.4)}</span>
      <span class="min-w-0 flex-1 truncate text-[14px] font-medium text-texto/[0.78] line-through decoration-texto/50">${esc(t.titulo)}</span>
      <span class="text-[13px] tenue">${nombreCorto(t.asignado)}</span>
    </a>`;

  return {
    ancho: ANCHO.app,
    html: `
      ${encabezado({ titulo: 'Etiqueta NFC', izq: atras('#/etiquetas') })}
      <div class="flex flex-col gap-3.5 md:grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-start md:gap-8">
        <div class="flex flex-col gap-3.5">
          <section class="vidrio-fuerte flex flex-col items-center gap-1.5 overflow-hidden rounded-[28px] px-5 pb-5 pt-4 text-center">
            ${escenaNfc(l, toque ? 'leida' : 'quieto', 132)}
            <p class="micro ${toque ? 'text-acento-tea' : 'tenue'}">${toque ? `Etiqueta leída · ${hora(new Date())}` : 'Etiqueta del lugar'}</p>
            <h2 class="h1">${l.nombre}</h2>
            <p class="text-[14px] leading-5 sec">${pend.length ? `${pend.length} ${pend.length === 1 ? 'tarea pendiente' : 'tareas pendientes'} ${enLugar(l)}` : `Todo al día ${enLugar(l)}`}</p>
          </section>
          <div class="hidden flex-col gap-2.5 md:flex">${accionesLugar(l)}</div>
        </div>
        <div class="flex flex-col gap-3">
          ${mias.length ? `<p class="micro tenue px-1 pt-1 md:pt-0">Te toca a ti</p>${mias.map(mia).join('')}` : ''}
          ${otras.length ? `<p class="micro tenue px-1 pt-1">De otros roomies</p>${otras.map(otra).join('')}` : ''}
          ${pend.length ? '' : `
          <div class="flex flex-col items-center gap-2 rounded-[22px] border border-texto/[0.14] capa-tenue p-6 text-center">
            <span class="burbuja size-11">${ic('check', 'size-5', 2)}</span>
            <p class="text-[15px] font-medium">Nada pendiente ${enLugar(l)}</p>
            <p class="text-[13px] leading-[18px] tenue">Si hiciste algo aquí, regístralo para que tu hogar lo vea.</p>
          </div>`}
          ${hechas.length ? `
          <p class="micro tenue px-1 pt-1">Hecho aquí</p>
          <div class="flex flex-col gap-2.5 rounded-[20px] border border-texto/[0.14] capa px-4 py-3">${hechas.map(hecha).join('')}</div>` : ''}
          <div class="flex flex-col gap-2.5 pt-1 md:hidden">${accionesLugar(l)}</div>
        </div>
      </div>`,
    montar() {
      if (!auto) return;
      const t = setTimeout(() => { if (location.hash === '#/nfc/' + l.id && auto.estado !== 'completada') completarDesdeEtiqueta(auto, true); }, 650);
      return () => clearTimeout(t);
    },
  };
};
const accionesLugar = l => `
  <button type="button" data-accion="nfc-registrar" data-id="${l.id}" class="btn-vidrio !h-12 text-[15px]">${ic('mas', 'size-5', 2)}Registrar algo que hice</button>
  <a href="#/nueva-tarea?lugar=${l.id}" class="btn-vidrio !h-12 text-[15px]">${ic('tareas', 'size-5')}Crear tarea ${enLugar(l)}</a>`;
