/* ---------- C2 · Tareas ---------- */
P.tareas = (q) => {
  if (q.get('f')) S.filtroTareas = q.get('f');
  const mias = S.tareas.filter(t => t.asignado === S.yo);
  const porVencer = pendientes().filter(t => !vencida(t));
  const venc = pendientes().filter(vencida);
  const filtros = [['todas', 'Todas', S.tareas.length], ['mias', 'Mías', mias.length], ['por-vencer', 'Por vencer', porVencer.length], ['vencidas', 'Vencidas', venc.length]];
  return {
    tab: 'tareas', ancho: ANCHO.app,
    html: `
      ${encabezado({ titulo: 'Tareas', izq: atras('#/inicio'), der: { icono: 'ayuda', etiqueta: 'Ayuda sobre tareas', accion: 'ayuda', id: 'tareas' } })}
      <div class="lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-10">
      <div class="flex flex-col gap-3">
        <label class="flex items-center gap-2.5 rounded-[22px] border border-texto/[0.14] bg-white/[0.6] px-4 py-3.5 transition focus-within:border-acento-teal">
          <span class="tenue">${ic('buscar', 'size-[19px]')}</span>
          <input id="buscar" type="search" value="${esc(S.buscar)}" placeholder="Buscar tareas o roomies…" aria-label="Buscar tareas o roomies"
            class="min-w-0 flex-1 bg-transparent text-[15px] leading-[22px] outline-none placeholder:text-texto/70 [&::-webkit-search-cancel-button]:hidden" />
        </label>
        <div class="sin-scroll -mx-5 flex gap-1.5 overflow-x-auto px-5 lg:mx-0 lg:px-0" role="tablist" aria-label="Filtrar tareas">
          ${filtros.map(([id, txt, n]) => `<button type="button" role="tab" aria-selected="${S.filtroTareas === id}" data-accion="filtro-tareas" data-id="${id}" class="chip ${S.filtroTareas === id ? 'chip-activo' : ''}">${txt} ${n}</button>`).join('')}
        </div>
        <div id="lista-tareas" class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-1"></div>
      </div>
      <aside id="panel-tarea" aria-label="Detalle de la tarea seleccionada" class="hidden lg:sticky lg:top-8 lg:block"></aside>
      </div>`,
    fab: `<a href="#/nueva-tarea" class="flex items-center gap-2 rounded-[26px] bg-gradient-to-r from-acento-claro to-acento-teal py-3.5 pl-[18px] pr-5 text-[16px] font-semibold leading-5 text-sobre shadow-brillo transition hover:brightness-105 active:scale-[0.98]">${ic('mas', 'size-5', 2)}Nueva tarea</a>`,
    montar() {
      const input = document.getElementById('buscar');
      input.addEventListener('input', () => { S.buscar = input.value; pintarListaTareas(); });
      /* Laptop: elegir una tarea abre su detalle en el panel derecho en vez de cambiar de pantalla */
      document.getElementById('lista-tareas').addEventListener('click', e => {
        const a = e.target.closest('a[href^="#/tarea/"]');
        if (a && matchMedia('(min-width: 1024px)').matches) { e.preventDefault(); S.tareaSel = a.getAttribute('href').split('/').pop(); pintarPanelTarea(); }
      });
      pintarListaTareas();
    },
  };
};
/* Panel de detalle (solo laptop) */
function pintarPanelTarea() {
  const cont = document.getElementById('panel-tarea'); if (!cont) return;
  const ids = [...document.querySelectorAll('#lista-tareas [data-tarea]')].map(e => e.dataset.tarea);
  const t = ids.includes(S.tareaSel) ? tarea(S.tareaSel) : tarea(ids[0]);
  document.querySelectorAll('#lista-tareas [data-tarea]').forEach(e => { const sel = !!t && e.dataset.tarea === t.id; e.classList.toggle('lg:ring-2', sel); e.classList.toggle('lg:ring-acento-teal', sel); });
  if (!t) { cont.innerHTML = `<div class="flex flex-col items-center gap-2 rounded-[28px] border border-texto/[0.14] bg-white/[0.45] p-10 text-center"><span class="burbuja size-11">${ic('tareas', 'size-5')}</span><p class="text-[15px] font-medium">Elige una tarea</p><p class="text-[13px] sec">Aquí verás su detalle.</p></div>`; return; }
  const hecha = t.estado === 'completada';
  cont.innerHTML = `
    <section class="vidrio-fuerte flex flex-col gap-4 rounded-[28px] p-6">
      <div class="flex items-center gap-3.5">
        <span class="burbuja size-[50px]">${ic('tareas', 'size-[23px]')}</span>
        <div class="flex min-w-0 flex-1 flex-col gap-0.5"><h2 class="h2 ${hecha ? 'line-through decoration-texto/40' : ''}">${esc(t.titulo)}</h2><p class="text-[13px] leading-[18px] tenue">${esc(t.lugar)}${t.repite ? ' · se repite cada semana' : ''}</p></div>
      </div>
      <div class="divisor"></div>
      <dl class="flex flex-col gap-3 text-[15px]">
        <div class="flex items-center justify-between gap-3"><dt class="sec">Asignada a</dt><dd class="flex items-center gap-2 font-medium">${avatar(t.asignado, 26, 10)}${nombreCorto(t.asignado)}</dd></div>
        <div class="flex items-center justify-between gap-3"><dt class="sec">Estado</dt><dd>${chipVence(t)}</dd></div>
        <div class="flex items-center justify-between gap-3"><dt class="sec">Vence</dt><dd class="font-medium">${cap(diaPalabra(t.vence))}, ${hora(t.vence)}</dd></div>
        <div class="flex items-center justify-between gap-3"><dt class="sec">Alertas</dt><dd class="font-medium">${t.alertas.length ? t.alertas.length + ' programadas' : 'Sin alertas'}</dd></div>
      </dl>
      <div class="flex flex-col gap-2.5 pt-1">
        <button type="button" data-accion="alternar-tarea" data-id="${t.id}" class="btn-primario !h-12 text-[15px]">${hecha ? 'Reabrir tarea' : 'Marcar como completada'}</button>
        <div class="flex gap-2.5"><a href="#/tarea/${t.id}" class="btn-sec flex-1">Ver detalle completo</a><a href="#/editar-tarea/${t.id}" class="btn-sec flex-1">${ic('editar', 'size-4')}Editar</a></div>
      </div>
    </section>`;
}
function pintarListaTareas() {
  const cont = document.getElementById('lista-tareas'); if (!cont) return;
  const b = S.buscar.trim().toLowerCase();
  let lista = S.tareas.filter(t => !b || t.titulo.toLowerCase().includes(b) || persona(t.asignado).nombre.toLowerCase().includes(b) || (t.asignado === S.yo && 'tú'.includes(b)));
  if (S.filtroTareas === 'mias') lista = lista.filter(t => t.asignado === S.yo);
  if (S.filtroTareas === 'por-vencer') lista = lista.filter(t => t.estado !== 'completada' && !vencida(t));
  if (S.filtroTareas === 'vencidas') lista = lista.filter(vencida);
  const ord = (a, b) => a.vence - b.vence;
  const grupos = [
    ['Vencidas', 'text-peligro', lista.filter(vencida).sort(ord)],
    ['Hoy', 'text-alerta', lista.filter(t => t.estado !== 'completada' && !vencida(t) && t.vence - Date.now() < D).sort(ord)],
    ['Esta semana', 'tenue', lista.filter(t => t.estado !== 'completada' && t.vence - Date.now() >= D).sort(ord)],
    ['Completadas', 'tenue', lista.filter(t => t.estado === 'completada').sort((a, b) => b.vence - a.vence)],
  ].filter(g => g[2].length);
  cont.innerHTML = grupos.length
    ? grupos.map(([t, c, l]) => `<p class="micro ${c} pt-1 md:col-span-2 lg:col-span-1">${t}</p>${l.map(filaTarea).join('')}`).join('')
    : `<div class="flex flex-col items-center gap-2 rounded-[22px] border border-texto/[0.14] bg-white/[0.45] p-8 text-center md:col-span-2 lg:col-span-1"><span class="burbuja size-11">${ic('buscar', 'size-5')}</span><p class="text-[15px] font-medium">Sin resultados</p><p class="text-[13px] tenue">Prueba con otro filtro o búsqueda.</p></div>`;
  pintarPanelTarea();
}
