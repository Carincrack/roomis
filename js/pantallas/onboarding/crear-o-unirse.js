/* ---------- A2 · Crear o unirse ---------- */
P['crear-o-unirse'] = () => {
  const op = (id, icono, titulo, desc) => {
    const sel = S.inicio === id;
    return `
      <button type="button" role="radio" aria-checked="${sel}" data-accion="elegir-inicio" data-id="${id}"
        class="flex w-full items-center gap-3.5 rounded-3xl p-[18px] text-left shadow-vidrio backdrop-blur-[12px] transition ${sel ? 'border-[1.5px] border-acento-teal capa-fuerte' : 'border border-texto/[0.14] capa hover:bg-velo/[0.09]'}">
        <span class="burbuja size-[52px]">${ic(icono, 'size-6')}</span>
        <span class="flex min-w-0 flex-1 flex-col gap-1">
          <span class="text-[16px] font-semibold leading-[22px]">${titulo}</span>
          <span class="text-[13px] leading-[18px] sec">${desc}</span>
        </span>
        ${sel ? `<span class="grid size-6 shrink-0 place-items-center rounded-full bg-acento-tea text-sobre">${ic('check', 'size-3.5', 2.4)}</span>`
              : `<span class="size-6 shrink-0 rounded-full border-[1.5px] border-texto/35"></span>`}
      </button>`;
  };
  return {
    html: `
      ${encabezado({ titulo: 'Tu hogar', izq: atras('#/bienvenida') })}
      <div class="flex flex-col gap-3.5 pt-3">
        <h2 class="h1">¿Cómo quieres empezar?</h2>
        <p class="text-[15px] leading-[22px] sec">Crea un hogar nuevo o únete al de tus roomies con un código de invitación.</p>
        <div class="h-1.5"></div>
        <div role="radiogroup" aria-label="Cómo empezar" class="flex flex-col gap-3.5">
          ${op('crear', 'casa', 'Crear un hogar', 'Configura tu vivienda, define las reglas e invita a tus roomies.')}
          ${op('unirse', 'entrar', 'Unirme con un código', 'Ingresa el código de 6 caracteres. El administrador aprobará tu ingreso.')}
        </div>
        <p class="flex gap-2.5 pl-1 text-[13px] leading-[18px] tenue"><span class="text-acento-tea">${ic('escudo', 'size-[18px]')}</span>Solo los miembros aprobados ven las tareas y gastos del hogar.</p>
      </div>`,
    cta: `<a href="${S.inicio === 'crear' ? '#/configurar-hogar' : '#/unirse'}" class="btn-primario group">Continuar ${ic('flecha-der', 'size-5 transition-transform group-hover:translate-x-0.5')}</a>`,
  };
};
