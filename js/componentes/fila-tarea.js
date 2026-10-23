function filaTarea(t) {
  const hecha = t.estado === 'completada';
  const borde = hecha ? 'border-texto/[0.1]' : vencida(t) ? 'border-peligro/45' : (t.vence - Date.now() < D ? 'border-alerta/40' : 'border-texto/[0.14]');
  return `
    <article data-tarea="${t.id}" class="group flex items-center gap-3 rounded-[20px] border ${borde} capa p-3.5 transition hover:bg-velo/[0.09]">
      <button type="button" data-accion="alternar-tarea" data-id="${t.id}" aria-label="${hecha ? 'Marcar como pendiente' : 'Marcar como hecha'}: ${esc(t.titulo)}"
        class="grid size-6 shrink-0 place-items-center rounded-lg border-[1.5px] transition ${hecha ? 'border-acento-tea bg-acento-tea text-sobre' : 'border-texto/40 hover:border-acento-tea'}">${hecha ? ic('check', 'size-3.5', 2.4) : ''}</button>
      <a href="#/tarea/${t.id}" class="flex min-w-0 flex-1 flex-col gap-1.5 rounded-lg">
        <span class="truncate text-[16px] font-semibold leading-[22px] ${hecha ? 'text-texto/[0.78] line-through decoration-texto/50' : ''}">${esc(t.titulo)}</span>
        <span class="flex items-center gap-2">${chipVence(t)}<span class="truncate text-[13px] leading-[18px] tenue">${nombreCorto(t.asignado)}${t.lugar && t.lugar !== 'Casa' ? ` · ${esc(t.lugar)}` : ''}</span></span>
      </a>
      ${avatar(t.asignado, 32, 12)}
    </article>`;
}
