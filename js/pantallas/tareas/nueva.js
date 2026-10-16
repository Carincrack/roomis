/* ---------- C3 · Crear y asignar tarea ---------- */
function nuevoBorrador() {
  const f = new Date(Date.now() + 5 * D); f.setHours(18, 0, 0, 0);
  return { titulo: '', asignado: S.yo, fecha: f, alertas: { '1d': true, '3h': true, '30m': false }, avisar: true, repetir: false };
}
function borradorDeTarea(t) {
  const a = t.alertas;
  return { titulo: t.titulo, asignado: t.asignado, fecha: new Date(t.vence), alertas: { '1d': a.includes('1d'), '3h': a.includes('3h'), '30m': a.includes('30m') }, avisar: !!t.avisar, repetir: !!t.repite };
}
P['nueva-tarea'] = () => {
  if (S.editando) { S.editando = null; S.borrador = null; }
  return formularioTarea(false);
};
P['editar-tarea'] = (q, id) => {
  const t = tarea(id);
  if (!t) { setTimeout(() => aviso('Esa tarea ya no existe', 'alerta')); return P.tareas(q); }
  if (S.editando !== id) { S.editando = id; S.borrador = borradorDeTarea(t); }
  return formularioTarea(true);
};
function formularioTarea(edicion) {
  const b = S.borrador || (S.borrador = nuevoBorrador());
  const opciones = [...S.miembros, 'rotar'];
  const per = id => {
    const sel = b.asignado === id;
    if (id === 'rotar') return `
      <button type="button" data-accion="asignar" data-id="rotar" aria-pressed="${sel}" class="flex flex-col items-center gap-1.5">
        <span class="grid size-[50px] place-items-center rounded-full border-[1.5px] border-dashed transition ${sel ? 'border-acento-tea bg-acento-teal/20 text-acento-tea shadow-[0_0_14px_rgba(11,122,90,0.3)]' : 'border-texto/30 text-texto/80 hover:border-white/50'}">${ic('repetir', 'size-5')}</span>
        <span class="text-[12px] font-medium leading-4 ${sel ? 'text-acento-tea' : 'sec'}">Rotar</span>
      </button>`;
    return `
      <button type="button" data-accion="asignar" data-id="${id}" aria-pressed="${sel}" class="flex flex-col items-center gap-1.5">
        <span class="avatar size-[50px] text-[18px] transition ${sel ? 'border-[3px] border-acento-tea shadow-[0_0_14px_rgba(11,122,90,0.3)]' : 'opacity-75 hover:opacity-100'}" style="background:${persona(id).color}">${esc(persona(id).ini)}</span>
        <span class="text-[12px] font-medium leading-4 ${sel ? 'text-acento-tea' : 'sec'}">${nombreCorto(id)}</span>
      </button>`;
  };
  const al = (k, txt) => `<button type="button" data-accion="alerta-borrador" data-id="${k}" aria-pressed="${b.alertas[k]}" class="chip px-3.5 ${b.alertas[k] ? 'chip-activo' : ''}">${ic(b.alertas[k] ? 'check' : 'mas', 'size-[15px]', 2)}${txt}</button>`;
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const hhmm = d => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  const quien = edicion ? 'Guardar cambios' : b.asignado === 'rotar' ? 'Crear con rotación' : b.asignado === S.yo ? 'Crear y asignármela' : `Crear y asignar a ${persona(b.asignado).corto}`;
  return {
    ancho: ANCHO.form,
    html: `
      ${encabezado({ titulo: edicion ? 'Editar tarea' : 'Nueva tarea', izq: atras(edicion ? '#/tarea/' + S.editando : '#/tareas'), der: { icono: 'ayuda', etiqueta: 'Ayuda', accion: 'ayuda', id: 'nueva' } })}
      <form id="form-tarea" class="flex flex-col gap-3 md:grid md:grid-cols-2 md:items-start md:gap-x-8 lg:gap-x-12" onsubmit="return false">
        <div class="flex flex-col gap-3">
        <label class="flex flex-col gap-2">
          <span class="text-[12px] font-medium leading-4 sec">Título de la tarea</span>
          <span class="campo border-[1.5px] border-acento-teal">
            <span class="text-acento-tea">${ic('tareas', 'size-5')}</span>
            <input id="titulo-tarea" required maxlength="60" value="${esc(b.titulo)}" placeholder="Ej. Limpiar la cocina" class="min-w-0 flex-1 bg-transparent text-[15px] leading-[22px] outline-none placeholder:text-texto/70" />
          </span>
        </label>
        <p class="micro tenue pt-1">Asignar a</p>
        <div class="flex items-start justify-between gap-2">${opciones.map(per).join('')}</div>
        <p class="micro tenue pt-1">Fecha límite</p>
        <div class="flex gap-2.5">
          <label class="relative flex min-w-0 flex-1 items-center gap-2.5 rounded-2xl border border-texto/[0.14] capa p-3.5 transition focus-within:border-acento-teal hover:bg-velo/[0.09]">
            <span class="text-acento-tea">${ic('calendario', 'size-[19px]')}</span>
            <span id="txt-fecha" class="truncate text-[15px] font-medium leading-[22px]">${diaCorto(b.fecha)}</span>
            <input id="fecha-tarea" type="date" value="${iso(b.fecha)}" class="absolute inset-0 opacity-0" aria-label="Fecha límite" />
          </label>
          <label class="relative flex min-w-0 flex-1 items-center gap-2.5 rounded-2xl border border-texto/[0.14] capa p-3.5 transition focus-within:border-acento-teal hover:bg-velo/[0.09]">
            <span class="text-acento-tea">${ic('reloj', 'size-[19px]')}</span>
            <span id="txt-hora" class="truncate text-[15px] font-medium leading-[22px]">${hora(b.fecha)}</span>
            <input id="hora-tarea" type="time" value="${hhmm(b.fecha)}" class="absolute inset-0 opacity-0" aria-label="Hora límite" />
          </label>
        </div>
        <p id="err-fecha" role="alert" class="hidden items-center gap-1.5 text-[12px] font-medium leading-4 text-peligro">${ic('alerta', 'size-3.5')}Esa fecha ya pasó. Elige una fecha y hora futuras.</p>
        </div>
        <div class="flex flex-col gap-3">
        <p class="micro tenue pt-1 md:pt-0">Alertas antes de que venza</p>
        <div class="flex flex-wrap gap-2">${al('1d', '1 día antes')}${al('3h', '3 h antes')}${al('30m', '30 min')}</div>
        <div class="flex flex-col gap-3 rounded-[20px] border border-texto/[0.14] capa px-4 py-3.5">
          <div class="flex items-center gap-3">
            <span class="burbuja size-[34px]">${ic('alerta', 'size-4')}</span>
            <div class="flex min-w-0 flex-1 flex-col gap-px">
              <p class="text-[15px] font-medium leading-[22px]">Avisar al hogar si se vence</p>
              <p class="text-[13px] leading-[18px] tenue">${b.asignado === 'rotar' || b.asignado === S.yo ? 'Todos' : persona(b.asignado).corto + ' y los demás'} verán el retraso</p>
            </div>
            ${interruptor(b.avisar, 'borrador:avisar', 'Avisar al hogar si se vence')}
          </div>
          <div class="flex items-center gap-3">
            <span class="burbuja size-[34px]">${ic('repetir', 'size-4')}</span>
            <div class="flex min-w-0 flex-1 flex-col gap-px">
              <p class="text-[15px] font-medium leading-[22px]">Repetir cada semana</p>
              <p class="text-[13px] leading-[18px] tenue">Rota entre los miembros</p>
            </div>
            ${interruptor(b.repetir, 'borrador:repetir', 'Repetir cada semana')}
          </div>
        </div>
        </div>
      </form>`,
    cta: `<button type="button" data-accion="crear-tarea" class="btn-primario group">${quien} ${ic('flecha-der', 'size-5 transition-transform group-hover:translate-x-0.5')}</button>`,
    montar() {
      const t = document.getElementById('titulo-tarea');
      t.addEventListener('input', () => { b.titulo = t.value; });
      document.getElementById('fecha-tarea').addEventListener('change', e => {
        if (!e.target.value) return; const [y, m, d] = e.target.value.split('-').map(Number);
        b.fecha.setFullYear(y, m - 1, d); document.getElementById('txt-fecha').textContent = diaCorto(b.fecha); ocultarErrorFecha();
      });
      document.getElementById('hora-tarea').addEventListener('change', e => {
        if (!e.target.value) return; const [h, mi] = e.target.value.split(':').map(Number);
        b.fecha.setHours(h, mi, 0, 0); document.getElementById('txt-hora').textContent = hora(b.fecha); ocultarErrorFecha();
      });
    },
  };
}
function ocultarErrorFecha() { const e = document.getElementById('err-fecha'); if (e) { e.classList.add('hidden'); e.classList.remove('flex'); } }
