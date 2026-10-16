/* ---------- Perfil · cuenta, hogar, reglas y ayuda ---------- */
P.perfil = () => {
  const yo = persona(S.yo), r = S.hogar.reglas, n = S.solicitudes.length;
  const regla = (clave, icono, titulo, desc) => `
    <div class="flex items-center gap-3">
      <span class="burbuja size-9">${ic(icono, 'size-[17px]')}</span>
      <div class="flex min-w-0 flex-1 flex-col gap-0.5">
        <p class="text-[15px] font-medium leading-[22px]">${titulo}</p>
        <p class="text-[13px] leading-[18px] tenue">${desc}</p>
      </div>
      ${interruptor(r[clave], `regla:${clave}`, titulo)}
    </div>`;
  const enlace = (icono, txt, extra, attrs) => `
    <a ${attrs} class="flex min-h-12 items-center gap-3 rounded-2xl px-1 transition hover:bg-texto/[0.04]">
      <span class="burbuja size-9">${ic(icono, 'size-[17px]')}</span>
      <span class="min-w-0 flex-1 text-[15px] font-medium leading-[22px]">${txt}</span>${extra}
      <span class="tenue">${ic('chevron', 'size-[18px]')}</span>
    </a>`;
  const boton = (icono, txt, accion, id) => `
    <button type="button" data-accion="${accion}" ${id ? `data-id="${id}"` : ''} class="flex min-h-12 w-full items-center gap-3 rounded-2xl px-1 text-left transition hover:bg-texto/[0.04]">
      <span class="burbuja size-9">${ic(icono, 'size-[17px]')}</span>
      <span class="min-w-0 flex-1 text-[15px] font-medium leading-[22px]">${txt}</span>
      <span class="tenue">${ic('chevron', 'size-[18px]')}</span>
    </button>`;
  return {
    tab: 'perfil', ancho: ANCHO.app,
    html: `
      ${encabezado({ titulo: 'Perfil', der: { icono: 'ayuda', etiqueta: 'Ayuda', accion: 'ayuda', id: 'tareas' } })}
      <div class="grid grid-cols-1 gap-3.5 pt-1 md:grid-cols-2 md:items-start md:gap-6">
        <div class="flex flex-col gap-3.5">
          <section class="vidrio-fuerte flex items-center gap-4 rounded-[28px] p-5">
            ${avatar(S.yo, 64, 22)}
            <div class="flex min-w-0 flex-1 flex-col gap-1">
              <h2 class="h2 truncate">${yo.nombre}</h2>
              <p class="flex items-center gap-1.5 text-[13px] leading-[18px] text-acento-tea">${soyAdmin() ? ic('corona', 'size-3.5') + 'Administrador' : ic('usuario', 'size-3.5') + 'Miembro'} de ${esc(S.hogar.nombre)}</p>
              ${pildoraNube('perfil')}
            </div>
          </section>
          <section class="vidrio flex flex-col gap-1 rounded-[24px] p-3">
            <p class="micro tenue px-1 pb-1 pt-1">Mi hogar</p>
            ${enlace('usuarios', 'Miembros', n ? `<span class="rounded-lg bg-alerta px-2 py-0.5 text-[12px] font-semibold text-sobre">${n} ${n === 1 ? 'solicitud' : 'solicitudes'}</span>` : `<span class="text-[13px] tenue">${S.miembros.length}</span>`, 'href="#/miembros"')}
            ${enlace('usuario-mas', 'Invitar con código', `<span class="font-serif text-[15px] tracking-[0.12em] text-acento-tea">${S.hogar.codigo}</span>`, 'href="#/codigo"')}
          </section>
        </div>
        <div class="flex flex-col gap-3.5">
          <section class="flex flex-col gap-3">
            <p class="micro tenue px-1">Reglas del hogar</p>
            <div class="flex flex-col gap-3.5 rounded-[20px] border border-texto/[0.14] capa p-4">
              ${regla('aprobar', 'escudo', 'Aprobar nuevos miembros', 'Tú decides quién entra al hogar')}
              <div class="divisor"></div>
              ${regla('dividir', 'billetera', 'Dividir gastos en partes iguales', 'Se calcula automáticamente')}
              <div class="divisor"></div>
              ${regla('alertas', 'alarma', 'Alertas de tiempo límite', 'Avisar antes de que venza una tarea')}
            </div>
          </section>
          <section class="flex flex-col gap-3">
            <p id="apariencia-t" class="micro tenue px-1">Apariencia</p>
            <div role="radiogroup" aria-labelledby="apariencia-t" class="grid grid-cols-3 gap-1 rounded-[20px] border border-texto/[0.14] capa p-1">
              ${[['sistema', 'pantalla', 'Automático'], ['claro', 'sol', 'Claro'], ['oscuro', 'luna', 'Oscuro']].map(([id, icono, txt]) => {
                const on = TEMA.pref() === id;
                return `<button type="button" role="radio" aria-checked="${on}" data-accion="tema" data-id="${id}" class="flex min-h-11 items-center justify-center gap-1.5 rounded-2xl text-[13px] font-semibold transition ${on ? 'chip-activo' : 'text-texto/[0.85] hover:bg-velo/[0.08]'}">${ic(icono, 'size-4')}${txt}</button>`;
              }).join('')}
            </div>
            <p class="px-1 text-[12px] leading-4 tenue">El modo claro tiene más contraste para usar la app bajo el sol.</p>
          </section>
          <section class="vidrio flex flex-col gap-1 rounded-[24px] p-3">
            <p class="micro tenue px-1 pb-1 pt-1">Ayuda</p>
            ${boton('tareas', 'Cómo funcionan las tareas', 'ayuda', 'tareas')}
            ${boton('billetera', 'Cómo se dividen los gastos', 'ayuda', 'gastos')}
          </section>
          <button type="button" data-accion="cerrar-sesion" class="btn-vidrio h-12 text-[15px] text-peligro">${ic('salir', 'size-5')}Cerrar sesión</button>
        </div>
      </div>`,
  };
};
