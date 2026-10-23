/* Router por hash y render de la vista actual.
   Cada pantalla se registra en P y devuelve { html, tab?, cta?, fab?, pie?, ancho?, completa?, montar? }
   tab: pestaña activa (muestra navegación) · cta: botón fijo inferior en móvil */
const P = {};

/* Anchos de contenido por formato: celular · tablet (md ≥ 768) · laptop (lg ≥ 1024) */
const ANCHO = {
  app:     'max-w-[560px] md:max-w-[880px] lg:max-w-[1200px]',
  form:    'max-w-[560px] md:max-w-[820px] lg:max-w-[1040px]',
  lectura: 'max-w-[560px] md:max-w-[720px] lg:max-w-[840px]',
};

let limpiar = null;
let rutaActual = '';
function ruta() {
  const [path, qs] = (location.hash.slice(1) || '/login').split('?');
  const partes = path.split('/').filter(Boolean);
  return { nombre: partes[0] || 'login', id: partes[1], q: new URLSearchParams(qs || '') };
}
const APP = new Set(['inicio', 'tareas', 'nueva-tarea', 'editar-tarea', 'tarea', 'perfil', 'avisos', 'miembros', 'gastos', 'gasto', 'nuevo-gasto', 'chat', 'codigo', 'etiquetas', 'nfc']);
const PUBLICAS = new Set(['login', 'registro', 'sistema']);
const SIN_HOGAR = new Set(['bienvenida', 'crear-o-unirse', 'configurar-hogar', 'unirse']);

/* Si alguien toca una etiqueta NFC sin sesión, después de entrar vuelve a ese lugar */
function recordarVuelta() { try { sessionStorage.setItem('roomies:volver', location.hash); } catch {} }
function tomarVuelta(destino) {
  let v = null;
  try { v = sessionStorage.getItem('roomies:volver'); sessionStorage.removeItem('roomies:volver'); } catch {}
  return v && destino === '#/inicio' ? v : destino;
}

/* A dónde debe ir cada quien según su sesión y su hogar (null = puede quedarse) */
function destinoPermitido(nombre) {
  if (!NUBE.listo) return PUBLICAS.has(nombre) ? null : 'cargando';
  if (!NUBE.sesion) { if (nombre === 'nfc') recordarVuelta(); return PUBLICAS.has(nombre) ? null : '#/login'; }
  const casa = tieneHogar() ? '#/inicio' : S.miEstado === 'pendiente' ? '#/esperando' : '#/bienvenida';
  if (nombre === 'login' || nombre === 'registro') return casa;
  if (APP.has(nombre)) return tieneHogar() ? null : casa;
  if (SIN_HOGAR.has(nombre)) return tieneHogar() || S.miEstado === 'pendiente' ? casa : null;
  if (nombre === 'esperando') return S.miEstado === 'pendiente' ? null : casa;
  return P[nombre] ? null : casa;
}

function render({ foco = null, conservarScroll = false } = {}) {
  const r = ruta();
  const destino = destinoPermitido(r.nombre);
  if (destino === 'cargando') {
    const barra = document.getElementById('barra'); barra.classList.add('hidden'); barra.classList.remove('grid');
    document.getElementById('lateral').classList.remove('md:flex');
    document.getElementById('app').innerHTML = `<div class="grid min-h-[100dvh] place-items-center"><div class="flex flex-col items-center gap-3 text-acento-tea">${ic('roomies', 'size-12 animate-pulse', 1.2)}<p class="text-[14px] tenue">Cargando tu hogar…</p></div></div>`;
    return;
  }
  if (destino && destino !== location.hash) { location.replace(destino); return; }
  const fn = P[r.nombre] || P.login;
  const v = fn(r.q, r.id);
  if (limpiar) { limpiar(); limpiar = null; }
  const esApp = APP.has(r.nombre);
  const app = document.getElementById('app');
  const lateral = document.getElementById('lateral');
  lateral.classList.toggle('md:flex', esApp);
  app.classList.toggle('md:pl-[88px]', esApp);
  app.classList.toggle('lg:pl-[264px]', esApp);

  const clave = location.hash;
  const animar = clave !== rutaActual;
  rutaActual = clave;
  const y = conservarScroll ? scrollY : 0;

  if (v.completa) {
    app.innerHTML = `<div class="${animar ? 'entrada' : ''}">${v.html}</div>`;
  } else {
    const ancho = v.ancho || 'max-w-[480px]';
    const conTab = !!v.tab;
    const pb = conTab ? (v.fab ? 'pb-[184px]' : 'pb-[120px]') : v.cta ? 'pb-[112px]' : 'pb-10';
    const cta = v.cta ? `
          <div class="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-fondo-bottom via-fondo-bottom/85 to-transparent px-5 pb-seguro pt-8 md:static md:mt-8 md:bg-none md:p-0">
            <div class="mx-auto w-full max-w-[480px] md:max-w-none ${esApp ? 'md:mx-0 lg:ml-auto lg:max-w-[380px]' : ''}">${v.cta}</div>
          </div>` : '';
    if (esApp) {
      app.innerHTML = `
      <div class="mx-auto w-full ${ancho} px-5 ${pb} md:px-8 md:pb-12 lg:px-10">
        <div class="${animar ? 'entrada' : ''}">${v.html}</div>
        ${cta}
        ${v.pie || ''}
        ${v.fab ? `
          <div class="pointer-events-none fixed inset-x-0 bottom-[104px] z-20 px-5 md:hidden">
            <div class="mx-auto flex w-full ${ancho} justify-end"><div class="pointer-events-auto">${v.fab}</div></div>
          </div>` : ''}
      </div>`;
    } else {
      /* Onboarding: celular a pantalla completa · tablet tarjeta centrada · laptop mitad marca / mitad formulario */
      app.innerHTML = `
      <div class="min-h-[100dvh] md:grid md:place-items-center md:p-8 lg:grid-cols-2 lg:p-0">
        <aside aria-hidden="true" class="hidden h-full w-full flex-col justify-between self-stretch border-r border-texto/[0.08] bg-velo/[0.03] p-14 lg:flex">
          <span class="flex items-center gap-3 text-acento-tea">${ic('roomies', 'size-10', 1.2)}<span class="font-serif text-[30px] font-medium text-texto">Roomies</span></span>
          <div class="flex max-w-[460px] flex-col gap-6">
            <h2 class="font-serif text-[44px] font-medium leading-[1.12] tracking-[-0.01em]">Vivir juntos,<br>sin enredos</h2>
            <ul class="flex flex-col gap-4 text-[17px] leading-6 sec">
              <li class="flex items-center gap-3"><span class="burbuja size-10">${ic('tareas', 'size-5')}</span>Tareas claras para cada roomie</li>
              <li class="flex items-center gap-3"><span class="burbuja size-10">${ic('billetera', 'size-5')}</span>Gastos divididos de forma justa</li>
              <li class="flex items-center gap-3"><span class="burbuja size-10">${ic('escudo', 'size-5')}</span>Un hogar en paz, con avisos a tiempo</li>
            </ul>
          </div>
          <p class="text-[13px] tenue">Hecho para casas y apartamentos compartidos.</p>
        </aside>
        <div class="mx-auto w-full ${ancho} px-5 ${pb} md:max-w-[560px] md:rounded-[32px] md:vidrio md:p-10 md:pb-10 md:[&_header]:!pt-0 lg:max-w-[540px] lg:border-0 lg:bg-transparent lg:bg-none lg:shadow-none lg:backdrop-blur-0">
          <div class="${animar ? 'entrada' : ''}">${v.html}</div>
          ${cta}
        </div>
      </div>`;
    }
  }
  pintarNavegacion(v.tab, !!v.tab);
  programarSync();
  if (v.montar) limpiar = v.montar() || null;
  scrollTo(0, y);
  if (foco != null) { const el = document.querySelector(`[data-otp="${foco}"]`); el && el.focus(); }
  else if (animar) { const h1 = app.querySelector('h1'); h1 && h1.setAttribute('tabindex', '-1'); }
  document.title = 'Roomies · ' + (app.querySelector('h1')?.textContent.trim() || 'Inicio');
}
const refrescar = (o = {}) => render({ conservarScroll: true, ...o });
function ir(h) { if (location.hash === h) refrescar(); else location.hash = h; }
