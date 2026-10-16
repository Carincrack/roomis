/* ---------- A3 · Configurar hogar ---------- */
P['configurar-hogar'] = () => {
  const r = S.hogar.reglas;
  const regla = (clave, icono, titulo, desc) => `
    <div class="flex items-center gap-3">
      <span class="burbuja size-9">${ic(icono, 'size-[17px]')}</span>
      <div class="flex min-w-0 flex-1 flex-col gap-0.5">
        <p class="text-[15px] font-medium leading-[22px]">${titulo}</p>
        <p class="text-[13px] leading-[18px] tenue">${desc}</p>
      </div>
      ${interruptor(r[clave], `regla:${clave}`, titulo)}
    </div>`;
  return {
    html: `
      ${encabezado({ titulo: 'Crear hogar', izq: atras('#/crear-o-unirse'), der: { icono: 'ayuda', etiqueta: 'Ayuda', accion: 'ayuda', id: 'hogar' } })}
      <div class="flex flex-col gap-3.5 pt-2">
        <div class="flex flex-col gap-2">
          <p class="micro text-acento-teal">Paso 1 de 2 · Datos del hogar</p>
          <div class="h-1 w-full overflow-hidden rounded-sm bg-white/[0.7]"><div class="h-1 w-1/2 rounded-sm bg-gradient-to-r from-acento-claro to-acento-teal"></div></div>
        </div>
        <h2 class="h2">Configura tu hogar</h2>
        <label class="flex flex-col gap-2">
          <span class="text-[12px] font-medium leading-4 sec">Nombre del hogar</span>
          <span class="campo border-[1.5px] border-acento-teal">
            <span class="text-acento-tea">${ic('casa', 'size-5')}</span>
            <input id="nombre-hogar" type="text" value="${esc(S.hogar.nombre)}" maxlength="40" autocomplete="off"
              class="min-w-0 flex-1 bg-transparent text-[15px] leading-[22px] outline-none placeholder:text-texto/70" placeholder="Ej. Apto 4B" />
          </span>
        </label>
        <div class="flex items-center gap-3 rounded-2xl border border-texto/[0.14] bg-white/[0.6] py-2.5 pl-4 pr-2.5">
          <span class="text-acento-tea">${ic('usuarios', 'size-5')}</span>
          <div class="flex min-w-0 flex-1 flex-col gap-0.5">
            <p class="text-[15px] leading-[22px]">Integrantes del hogar</p>
            <p class="text-[13px] leading-[18px] tenue">Incluyéndote a ti</p>
          </div>
          <div class="flex items-center gap-3.5 rounded-[20px] bg-white/[0.6] p-1.5">
            <button type="button" data-accion="integrantes:-1" aria-label="Quitar integrante" class="grid size-7 place-items-center rounded-full bg-white/[0.7] text-[16px] font-semibold transition hover:bg-white/[0.9] disabled:opacity-40" ${S.hogar.integrantes <= 1 ? 'disabled' : ''}>−</button>
            <span class="w-4 text-center text-[16px] font-semibold leading-[22px]" aria-live="polite">${S.hogar.integrantes}</span>
            <button type="button" data-accion="integrantes:1" aria-label="Agregar integrante" class="grid size-7 place-items-center rounded-full bg-white/[0.7] text-[16px] font-semibold transition hover:bg-white/[0.9] disabled:opacity-40" ${S.hogar.integrantes >= 12 ? 'disabled' : ''}>+</button>
          </div>
        </div>
        <p class="micro tenue">Reglas del hogar</p>
        <div class="flex flex-col gap-3.5 rounded-[20px] border border-texto/[0.14] bg-white/[0.6] p-4">
          ${regla('aprobar', 'escudo', 'Aprobar nuevos miembros', 'Tú decides quién entra al hogar')}
          <div class="divisor"></div>
          ${regla('dividir', 'billetera', 'Dividir gastos en partes iguales', 'Se calcula automáticamente')}
          <div class="divisor"></div>
          ${regla('alertas', 'alarma', 'Alertas de tiempo límite', 'Avisar antes de que venza una tarea')}
        </div>
      </div>`,
    cta: `<button type="button" data-accion="crear-hogar" class="btn-primario group">Crear hogar ${ic('flecha-der', 'size-5 transition-transform group-hover:translate-x-0.5')}</button>`,
  };
};
