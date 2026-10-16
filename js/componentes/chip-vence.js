function chipVence(t) {
  if (t.estado === 'completada') return `<span class="flex items-center gap-[5px] rounded-[10px] capa px-2 py-1 text-[12px] font-medium leading-4 text-texto/70">${ic('check', 'size-[13px]')}Hecha</span>`;
  const r = relativo(t.vence);
  if (r.pasado) return `<span class="flex items-center gap-[5px] rounded-[10px] bg-peligro-fondo px-2 py-1 text-[12px] font-medium leading-4 text-peligro">${ic('alerta', 'size-[13px]')}Hace ${r.texto}</span>`;
  if (t.vence - Date.now() < D) return `<span class="flex items-center gap-[5px] rounded-[10px] bg-alerta-fondo px-2 py-1 text-[12px] font-medium leading-4 text-alerta">${ic('alarma', 'size-[13px]')}Quedan ${r.texto}</span>`;
  return `<span class="flex items-center gap-[5px] rounded-[10px] bg-acento-fondo px-2 py-1 text-[12px] font-medium leading-4 text-acento-tea">${ic('calendario', 'size-[13px]')}${cap(DIAS[t.vence.getDay()].slice(0,3))} ${hora(t.vence)}</span>`;
}
