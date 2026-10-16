/* Navegación: barra inferior (móvil) y barra lateral (escritorio) */
const TABS = [
  ['inicio', 'Inicio', 'casa', '#/inicio'],
  ['gastos', 'Gastos', 'billetera', '#/gastos'],
  ['tareas', 'Tareas', 'tareas', '#/tareas'],
  ['chat', 'Chat', 'chat', '#/chat'],
  ['avisos', 'Avisos', 'campana', '#/avisos'],
  ['perfil', 'Perfil', 'usuario', '#/perfil'],
];
/* La lente de vidrio ocupa una columna de cinco y se desliza desde la pestaña anterior.
   translateX en % es relativo a su propio ancho: no depende de medir el layout. */
let lentePrevia = null;
function moverLente(barra, i) {
  const lente = barra.querySelector('.lente-mov');
  if (!lente || i < 0) return;
  lente.style.transition = 'none';
  lente.style.transform = `translateX(${(lentePrevia ?? i) * 100}%)`;
  lente.getBoundingClientRect();
  lente.style.transition = '';
  lente.style.transform = `translateX(${i * 100}%)`;
  lentePrevia = i;
}
function pintarNavegacion(tab, visible) {
  const barra = document.getElementById('barra'), lat = document.getElementById('lateral');
  const punto = id => (id === 'avisos' && S.sinLeer) || (id === 'chat' && S.chatSinLeer > 0);
  barra.innerHTML = `<span aria-hidden="true" class="lente-mov pointer-events-none absolute inset-y-[7px] left-2 w-[calc((100%-16px)/6)] p-0"><span class="lente block size-full rounded-[22px]"></span></span>` +
    TABS.map(([id, txt, icono, ir]) => {
    const act = id === tab;
    return `<a href="${ir}" class="relative z-10 flex h-[58px] flex-col items-center justify-center gap-1 rounded-[22px] transition-colors duration-200 ${act ? 'text-texto' : 'text-texto/75 hover:text-texto'}" ${act ? 'aria-current="page"' : ''}>
      <span class="relative grid h-7 place-items-center">${ic(icono, 'size-[21px]', act ? 2 : 1.8)}${punto(id) ? '<span class="absolute -right-1 top-0 size-2 rounded-full border border-fondo-mid bg-alerta"></span>' : ''}</span>
      <span class="text-[11px] font-medium leading-4">${txt}</span></a>`;
  }).join('');
  barra.classList.toggle('hidden', !visible);
  barra.classList.toggle('grid', visible);
  if (visible) moverLente(barra, TABS.findIndex(([id]) => id === tab));

  /* Tablet: riel de iconos (88 px) · Laptop: menú completo (264 px) */
  lat.innerHTML = `
    <a href="#/inicio" aria-label="Roomies, ir al inicio" class="flex items-center justify-center gap-2.5 text-acento-tea lg:justify-start lg:px-2">${ic('roomies', 'size-8', 1.3)}<span class="hidden font-serif text-[26px] font-medium text-texto lg:inline">Roomies</span></a>
    <a href="#/miembros" class="hidden items-center gap-3 rounded-[20px] border border-texto/[0.14] capa p-3 transition hover:bg-velo/[0.09] lg:flex">
      <span class="burbuja size-10">${ic('casa', 'size-5')}</span>
      <span class="flex min-w-0 flex-col"><span class="truncate text-[15px] font-semibold">${esc(S.hogar.nombre)}</span><span class="text-[12px] tenue">${S.miembros.length} miembros${S.solicitudes.length ? ` · ${S.solicitudes.length} solicitud${S.solicitudes.length > 1 ? 'es' : ''}` : ''}</span></span>
    </a>
    <nav class="flex flex-col gap-1.5 lg:gap-1">${TABS.map(([id, txt, icono, ir]) => {
      const act = id === tab;
      return `<a href="${ir}" class="relative flex flex-col items-center gap-1 rounded-2xl px-1 py-2.5 text-[11px] font-medium transition lg:flex-row lg:gap-3 lg:px-3 lg:text-[15px] ${act ? 'lente' : 'border border-transparent text-texto/70 hover:bg-velo/[0.07] hover:text-texto'}" ${act ? 'aria-current="page"' : ''}>${ic(icono, 'size-[22px] lg:size-5')}<span>${txt}</span>${punto(id) ? '<span class="absolute right-3 top-2 size-2 rounded-full bg-alerta lg:static lg:ml-auto"></span>' : ''}</a>`;
    }).join('')}</nav>
    <a href="#/nueva-tarea" aria-label="Nueva tarea" class="btn-primario mx-auto mt-2 !h-12 !w-12 !rounded-2xl !px-0 text-[15px] lg:!w-full lg:!rounded-[27px] lg:!px-6">${ic('mas', 'size-5', 2)}<span class="hidden lg:inline">Nueva tarea</span></a>
    <a href="#/perfil" class="mt-auto flex items-center justify-center gap-3 rounded-2xl p-1 transition hover:bg-velo/[0.07] lg:justify-start lg:px-1">${avatar(S.yo, 38, 13)}<div class="hidden min-w-0 lg:block"><p class="truncate text-[14px] font-medium">${esc(persona(S.yo).nombre)}</p><p class="text-[12px] tenue">${soyAdmin() ? 'Administrador' : 'Miembro'}</p><div class="mt-1">${pildoraNube('lateral')}</div></div></a>`;
}
