/* ---------- C5 · Avisos y alertas ---------- */
P.avisos = () => {
  const f = S.filtroAvisos;
  const lista = S.avisos.filter(a => f === 'todos' || a.cat === f);
  const tarjeta = a => {
    if (a.tipo === 'por-vencer') {
      const t = tarea(a.tarea); if (!t || t.estado === 'completada') return '';
      return base('border-alerta/45', 'bg-alerta-fondo text-alerta', 'alarma', `${esc(t.titulo)} vence en ${relativo(t.vence).texto}`, a.hora,
        `Alerta de 3 h antes · asignada a ${t.asignado === S.yo ? 'ti' : persona(t.asignado).corto}`,
        `<a href="#/tarea/${t.id}" class="btn-sec px-3 py-2 rounded-xl">Ver tarea</a><button type="button" class="btn-acento px-3 py-2 rounded-xl" data-accion="completar-tarea" data-id="${t.id}" data-quedarse="1">${ic('check', 'size-[15px]', 2)}Ya la hice</button>`);
    }
    if (a.tipo === 'vencida') {
      const t = tarea(a.tarea); if (!t) return '';
      const p = persona(t.asignado);
      return base('border-peligro/45', 'bg-peligro-fondo text-peligro', 'alerta', `${esc(t.titulo)} se venció`, a.hora,
        `${p.corto} no la marcó a tiempo · todo el hogar fue avisado`,
        `<button type="button" class="btn-sec px-3 py-2 rounded-xl" data-accion="recordar" data-id="${t.asignado}">${ic('campana', 'size-[15px]')}Recordar a ${p.corto}</button>`);
    }
    if (a.tipo === 'solicitud') {
      const pendiente = S.solicitudes.some(s => s.id === a.persona);
      return base('border-texto/[0.14]', 'burbuja', 'usuario-mas', `${persona(a.persona).nombre} quiere unirse`, a.hora,
        `Solicitud con el código ${S.hogar.codigo.slice(0,3)}·${S.hogar.codigo.slice(3)}`,
        pendiente ? `<a href="#/miembros" class="btn-acento px-3 py-2 rounded-xl">Revisar solicitud</a>` : `<span class="text-[12px] font-medium text-acento-teal">Ya respondiste</span>`);
    }
    if (a.tipo === 'nfc') {
      const t = tarea(a.tarea); if (!t) return '';
      const l = lugarPorNombre(t.lugar), quien = a.persona === S.yo ? 'Marcaste' : `${esc(persona(a.persona).corto)} marcó`;
      return base('border-texto/[0.14]', 'burbuja', 'nfc', `${quien} “${esc(t.titulo)}”`, a.hora,
        `Con la etiqueta ${l ? delLugar(l) : 'NFC'}${t.asignado !== a.persona ? ` · le tocaba a ${t.asignado === S.yo ? 'ti' : esc(persona(t.asignado).corto)}` : ''}${t.estado === 'completada' ? '' : ' · se volvió a abrir'}`,
        `<a href="#/tarea/${t.id}" class="btn-sec px-3 py-2 rounded-xl">Ver tarea</a>`);
    }
    if (a.tipo === 'gasto') {
      const g = gasto(a.gasto); if (!g) return '';
      return base('border-texto/[0.14]', 'burbuja', 'billetera', `${persona(g.pago).corto} registró ${esc(g.titulo)} · ${crc(g.monto)}`, a.hora,
        g.entre.includes(S.yo) && !g.pagados.includes(S.yo) ? `Tu parte: ${crc(parte(g))}` : 'Dividido entre el hogar',
        `<a href="#/gasto/${g.id}" class="btn-sec px-3 py-2 rounded-xl">Ver gasto</a>`);
    }
    return '';
  };
  function base(borde, burb, icono, titulo, h, desc, acciones) {
    return `
      <article class="flex items-start gap-3 rounded-[22px] border ${borde} capa-fuerte p-3.5 entrada">
        <span class="grid size-10 shrink-0 place-items-center rounded-full border border-acento-tea/25 ${burb}">${ic(icono, 'size-[18px]')}</span>
        <div class="flex min-w-0 flex-1 flex-col gap-[3px]">
          <div class="flex items-start gap-2"><p class="min-w-0 flex-1 text-[15px] font-medium leading-[22px]">${titulo}</p><p class="shrink-0 text-[12px] font-medium leading-4 tenue">${hora(h)}</p></div>
          <p class="text-[13px] leading-[18px] tenue">${desc}</p>
          <div class="flex flex-wrap gap-2 pt-1.5">${acciones}</div>
        </div>
      </article>`;
  }
  const hoy = lista.filter(a => mismoDia(a.hora, new Date())), antes = lista.filter(a => !mismoDia(a.hora, new Date()));
  const sec = (t, l) => { const h = l.map(tarjeta).join(''); return h ? `<p class="micro tenue pt-1">${t}</p>${h}` : ''; };
  const cuerpo = sec('Hoy', hoy) + sec('Antes', antes);
  const filtros = [['todos', `Todos ${S.avisos.length}`], ['tareas', 'Tareas'], ['hogar', 'Hogar'], ['gastos', 'Gastos']];
  return {
    tab: 'avisos', ancho: ANCHO.lectura,
    html: `
      ${encabezado({ titulo: 'Avisos', der: { icono: 'check', etiqueta: 'Marcar todo como leído', accion: 'leer-avisos' } })}
      <div class="flex flex-col gap-3">
        <div class="sin-scroll -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:px-0" role="tablist" aria-label="Filtrar avisos">
          ${filtros.map(([id, txt]) => `<button type="button" role="tab" aria-selected="${f === id}" data-accion="filtro-avisos" data-id="${id}" class="chip px-3.5 ${f === id ? 'chip-activo' : ''}">${txt}</button>`).join('')}
        </div>
        ${cuerpo || `<div class="flex flex-col items-center gap-2 rounded-[22px] border border-texto/[0.14] capa-tenue p-8 text-center"><span class="burbuja size-11">${ic('campana', 'size-5')}</span><p class="text-[15px] font-medium">Nada por aquí</p><p class="text-[13px] tenue">No hay avisos en esta categoría.</p></div>`}
      </div>`,
  };
};

