/* ---------- B1 · Miembros y solicitudes (B2 diálogo, B3 aviso) ---------- */
P.miembros = () => {
  const n = S.solicitudes.length;
  const sol = s => {
    const p = persona(s.id);
    return `
      <article class="flex flex-col gap-3.5 rounded-[22px] border border-alerta/35 bg-white/[0.6] p-4 entrada">
        <div class="flex items-center gap-3">
          ${avatar(s.id)}
          <div class="flex min-w-0 flex-1 flex-col gap-0.5">
            <p class="truncate text-[16px] font-semibold leading-[22px]">${p.nombre}</p>
            <p class="text-[13px] leading-[18px] tenue">Quiere unirse · ${s.hace}</p>
          </div>
        </div>
        <div class="flex gap-2.5">
          <button type="button" class="btn-sec flex-1" data-accion="pedir-rechazo" data-id="${s.id}">${ic('x', 'size-4')}Rechazar</button>
          <button type="button" class="btn-acento flex-1" data-accion="aceptar" data-id="${s.id}">${ic('check', 'size-4')}Aceptar</button>
        </div>
      </article>`;
  };
  const miembro = (id, i) => {
    const p = persona(id), yo = id === S.yo, nuevo = S.nuevos.includes(id);
    return `
      ${i ? '<div class="divisor"></div>' : ''}
      <div class="flex items-center gap-3">
        ${avatar(id)}
        <div class="flex min-w-0 flex-1 flex-col gap-0.5">
          <p class="truncate text-[16px] font-semibold leading-[22px]">${p.nombre}</p>
          <p class="text-[13px] leading-[18px] tenue">${yo ? 'Tú · creó el hogar' : nuevo ? 'Nueva · se unió hace un momento' : `Miembro · ${p.activas ?? 0} tareas activas`}</p>
        </div>
        ${yo ? `<span class="flex items-center gap-[5px] rounded-xl bg-acento-teal/[0.18] px-2.5 py-1.5 text-[12px] font-medium leading-4 text-acento-tea">${ic('corona', 'size-3.5')}Admin</span>`
             : `<button type="button" class="grid size-9 place-items-center rounded-full text-texto/70 transition hover:bg-white/[0.65] hover:text-texto" aria-label="Opciones de ${p.corto}" data-accion="opciones-miembro" data-id="${id}">${ic('mas-opciones', 'size-5', 2.4)}</button>`}
      </div>`;
  };
  return {
    tab: 'perfil', ancho: ANCHO.app,
    html: `
      ${encabezado({ titulo: 'Miembros', izq: atras('#/perfil'), der: { icono: 'usuario-mas', etiqueta: 'Invitar', ir: '#/codigo' } })}
      <p class="flex items-center gap-2 pb-3 text-[13px] leading-[18px] sec"><span class="text-acento-tea">${ic('casa', 'size-4')}</span>${esc(S.hogar.nombre)} · ${S.miembros.length} miembros · código ${S.hogar.codigo.slice(0,3)}·${S.hogar.codigo.slice(3)}</p>
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2 md:items-start md:gap-6">
        <section class="flex flex-col gap-3">
          ${n ? `<p class="micro flex items-center gap-2 text-alerta">${n === 1 ? 'Solicitud pendiente' : 'Solicitudes pendientes'}<span class="rounded-lg bg-alerta px-[7px] py-0.5 text-sobre">${n}</span></p>
                 ${S.solicitudes.map(sol).join('')}`
              : `<div class="flex items-center gap-3 rounded-[22px] border border-texto/[0.14] bg-white/[0.45] p-4 text-[13px] leading-[18px] sec"><span class="burbuja size-9">${ic('check', 'size-4')}</span>No hay solicitudes pendientes.</div>`}
        </section>
        <section class="flex flex-col gap-3">
          <p class="micro tenue">Miembros · ${S.miembros.length}</p>
          <div class="vidrio flex flex-col gap-3 rounded-[22px] p-4">${S.miembros.map(miembro).join('')}</div>
        </section>
      </div>`,
  };
};

