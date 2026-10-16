/* ---------- C1 · Inicio ---------- */
function textoActividad(a) {
  if (a.tipo === 'solicitud') return `${esc(persona(a.persona).nombre)} quiere unirse`;
  if (a.tipo === 'gasto') { const g = gasto(a.gasto); return g ? `Se registró ${esc(g.titulo)} · ${crc(g.monto)}` : 'Gasto registrado'; }
  const t = tarea(a.tarea); const n = t ? `“${esc(t.titulo)}”` : 'Una tarea';
  return a.tipo === 'vencida' ? `${n} se venció` : `${n} está por vencer`;
}
P.inicio = () => {
  const total = S.tareas.length, hechas = S.tareas.filter(t => t.estado === 'completada').length;
  const porVencer = pendientes().filter(t => !vencida(t)).length;
  const vencidas = pendientes().filter(vencida).length;
  const mia = pendientes().filter(t => t.asignado === S.yo && !vencida(t)).sort((a, b) => a.vence - b.vence)[0];
  const proximas = pendientes().sort((a, b) => a.vence - b.vence).slice(0, 3);
  const accion = (icono, txt, ir, activa) => `
    <a href="${ir}" class="group flex flex-col items-center gap-1.5">
      <span class="grid size-[60px] place-items-center rounded-[18px] transition group-hover:scale-105 ${activa ? 'border border-white/60 bg-gradient-to-br from-acento-claro to-acento-teal text-sobre shadow-brillo' : 'border border-texto/[0.14] bg-white/[0.6] group-hover:bg-white/[0.7]'}">${ic(icono, 'size-6')}</span>
      <span class="text-[12px] font-medium leading-4 ${activa ? '' : 'sec'}">${txt}</span>
    </a>`;
  return {
    tab: 'inicio', ancho: ANCHO.app,
    html: `
      <header class="sticky top-0 z-20 -mx-5 flex items-center gap-3 bg-gradient-to-b from-fondo-top/90 to-fondo-top/0 px-5 pb-3 pt-seguro backdrop-blur-[6px] md:static md:mx-0 md:bg-none md:px-0 md:pb-5 md:pt-8 md:[backdrop-filter:none]">
        ${avatar(S.yo, 46, 17)}
        <div class="flex min-w-0 flex-1 flex-col">
          <p class="text-[13px] leading-[18px] tenue">${saludo()}</p>
          <h1 class="h2 truncate md:text-[30px] md:leading-9">Hola, ${S.personas[S.yo].corto}</h1>
        </div>
        <a href="#/avisos" class="btn-icono relative" aria-label="Avisos${S.sinLeer ? ' (sin leer)' : ''}">${ic('campana', 'size-5')}${S.sinLeer ? '<span class="absolute right-[9px] top-[9px] size-[9px] rounded-full border border-fondo-top bg-alerta"></span>' : ''}</a>
      </header>

      <div class="grid grid-cols-1 gap-3.5 pt-1 md:grid-cols-2 md:gap-6 lg:gap-8 xl:grid-cols-[1.1fr_1fr_0.9fr]">
        <div class="flex flex-col gap-3.5">
          ${mia ? `
          <a href="#/tarea/${mia.id}" class="vidrio flex items-center gap-3 rounded-[20px] border-alerta/55 p-3.5 transition hover:bg-white/[0.65]">
            <span class="grid size-10 shrink-0 place-items-center rounded-full border border-acento-tea/25 bg-alerta/[0.16] text-alerta">${ic('alarma', 'size-[18px]')}</span>
            <span class="flex min-w-0 flex-1 flex-col gap-0.5">
              <span class="text-[16px] font-semibold leading-[22px]">${esc(mia.titulo)} vence en ${relativo(mia.vence).texto}</span>
              <span class="text-[13px] leading-[18px] text-alerta">Asignada a ti · ${diaPalabra(mia.vence)} ${hora(mia.vence)}</span>
            </span>
            <span class="text-texto/70">${ic('chevron', 'size-[18px]')}</span>
          </a>` : ''}

          <section class="vidrio-fuerte relative flex flex-col gap-3 overflow-hidden rounded-[28px] px-5 pb-[18px] pt-5">
            <span aria-hidden="true" class="pointer-events-none absolute right-[-12px] top-[-14px] text-texto opacity-[0.16]">${ic('roomies', 'size-[150px]', 0.6)}</span>
            <p class="text-[13px] leading-[18px] sec">Esta semana en</p>
            <h2 class="h1">${esc(S.hogar.nombre)}</h2>
            <div class="flex flex-col gap-1.5">
              <p class="text-[12px] font-medium leading-4 sec">${hechas} de ${total} tareas completadas</p>
              <div class="h-1.5 w-full overflow-hidden rounded-[3px] bg-white/[0.7]" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${hechas}">
                <div class="h-1.5 rounded-[3px] bg-gradient-to-r from-acento-claro to-acento-teal transition-all duration-500" style="width:${(hechas / total) * 100}%"></div>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <a href="#/tareas?f=por-vencer" class="flex flex-col rounded-[14px] bg-alerta/[0.16] px-2.5 py-2 transition hover:bg-alerta/25"><span class="text-[16px] font-semibold leading-[22px] text-alerta">${porVencer}</span><span class="text-[12px] font-medium leading-4 sec">Por vencer</span></a>
              <a href="#/tareas?f=vencidas" class="flex flex-col rounded-[14px] bg-peligro/[0.16] px-2.5 py-2 transition hover:bg-peligro/25"><span class="text-[16px] font-semibold leading-[22px] text-peligro">${vencidas}</span><span class="text-[12px] font-medium leading-4 sec">${vencidas === 1 ? 'Vencida' : 'Vencidas'}</span></a>
              <a href="#/gastos" class="flex flex-col rounded-[14px] bg-acento-teal/[0.18] px-2.5 py-2 transition hover:bg-acento-teal/25"><span class="truncate text-[16px] font-semibold leading-[22px] text-acento-tea">${crc(debo())}</span><span class="text-[12px] font-medium leading-4 sec">Debes</span></a>
            </div>
          </section>

          <div class="flex items-start justify-between px-1 xs:px-0">
            ${accion('mas', 'Nueva tarea', '#/nueva-tarea', true)}
            ${accion('usuario-mas', 'Asignar', '#/nueva-tarea')}
            ${accion('billetera', 'Gasto', '#/nuevo-gasto')}
            ${accion('usuarios', 'Miembros', '#/miembros')}
          </div>
        </div>

        <section class="flex flex-col gap-3.5">
          <div class="flex items-center justify-between">
            <h2 class="h3">Próximas tareas</h2>
            <a href="#/tareas" class="flex items-center gap-1 text-[12px] font-medium leading-4 text-acento-teal hover:text-acento-tea">Ver todas ${ic('flecha-der', 'size-3.5')}</a>
          </div>
          ${proximas.length ? proximas.map(filaTarea).join('') : `<p class="rounded-[20px] border border-texto/[0.14] bg-white/[0.45] p-4 text-[13px] sec">¡Todo al día! No hay tareas pendientes.</p>`}
        </section>

        <!-- Solo pantallas anchas: actividad y gastos a la vista -->
        <aside class="hidden flex-col gap-3.5 xl:flex" aria-label="Actividad del hogar">
          <h2 class="h3">Actividad reciente</h2>
          <div class="vidrio flex flex-col gap-3 rounded-[22px] p-4">
            ${S.avisos.slice(0, 4).map((a, i) => `${i ? '<div class="divisor"></div>' : ''}<a href="#/avisos" class="flex items-start gap-3 rounded-xl transition hover:opacity-80"><span class="burbuja size-8">${ic(a.cat === 'tareas' ? 'tareas' : a.cat === 'gastos' ? 'billetera' : 'usuario-mas', 'size-4')}</span><span class="flex min-w-0 flex-1 flex-col"><span class="text-[14px] font-medium leading-5">${textoActividad(a)}</span><span class="text-[12px] leading-4 tenue">${cap(diaPalabra(a.hora))} · ${hora(a.hora)}</span></span></a>`).join('')}
          </div>
          <div class="flex items-center justify-between"><h2 class="h3">Gastos recientes</h2><a href="#/gastos" class="text-[12px] font-medium text-acento-teal hover:text-acento-tea">Ver todos</a></div>
          <div class="vidrio flex flex-col gap-3 rounded-[22px] p-4">
            ${S.gastos.slice().sort((a, b) => b.fecha - a.fecha).slice(0, 3).map((g, i) => `${i ? '<div class="divisor"></div>' : ''}<a href="#/gasto/${g.id}" class="flex items-center gap-3 transition hover:opacity-80"><span class="burbuja size-8">${ic(g.cat, 'size-4')}</span><span class="min-w-0 flex-1 truncate text-[14px] font-medium">${esc(g.titulo)}</span><span class="text-[14px] font-semibold">${crc(g.monto)}</span></a>`).join('')}
          </div>
        </aside>
      </div>`,
  };
};

