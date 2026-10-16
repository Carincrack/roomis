/* ---------- A4 · Código de invitación ---------- */
P.codigo = () => {
  const c = S.hogar.codigo;
  return {
    html: `
      ${encabezado({ titulo: 'Hogar creado', der: { icono: 'x', etiqueta: 'Cerrar', ir: '#/inicio' } })}
      <div class="flex flex-col items-center gap-3.5 pt-1 text-center">
        <span class="burbuja size-[76px] text-acento-tea shadow-brillo">${ic('check', 'size-[34px]', 1.6)}</span>
        <h2 class="h1">¡Tu hogar está listo!</h2>
        <p class="max-w-[300px] text-[15px] leading-[22px] sec">Comparte este código con tus roomies. Cada solicitud te llegará para que la apruebes.</p>
        <div class="h-0.5"></div>
        <div class="vidrio-fuerte flex w-full flex-col items-center gap-2.5 rounded-[28px] px-5 pb-5 pt-6">
          <p class="micro tenue">Código de invitación</p>
          <p class="font-serif text-[30px] font-medium leading-10 tracking-[0.12em] text-acento-tea xs:text-[34px]" aria-label="Código ${c.split('').join(' ')}">${c.slice(0,3)} · ${c.slice(3)}</p>
          <p class="flex items-center gap-1.5 text-[13px] leading-[18px] tenue">${ic('reloj', 'size-3.5')}${esc(S.hogar.nombre)} · vence en 48 h</p>
          <div class="h-1"></div>
          <div class="flex w-full gap-2.5">
            <button type="button" data-accion="copiar-codigo" class="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-texto/[0.16] bg-white/[0.65] py-3 text-[15px] font-medium leading-[22px] transition hover:bg-white/[0.8] active:scale-[0.98]">${ic('copiar', 'size-[18px]')}Copiar</button>
            <button type="button" data-accion="compartir-codigo" class="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-texto/[0.16] bg-white/[0.65] py-3 text-[15px] font-medium leading-[22px] transition hover:bg-white/[0.8] active:scale-[0.98]">${ic('compartir', 'size-[18px]')}Compartir</button>
          </div>
        </div>
        <p class="flex items-center gap-2 rounded-[20px] bg-acento-teal/[0.18] px-3.5 py-2 text-[12px] font-medium leading-4 text-acento-tea">${ic('usuarios', 'size-4')}${S.miembros.length > 1 ? S.miembros.length : 1} de ${S.hogar.integrantes} integrantes · esperando a ${Math.max(0, S.hogar.integrantes - (S.miembros.length > 1 ? S.miembros.length : 1))}</p>
      </div>`,
    cta: `<a href="#/inicio" class="btn-primario group">Ir a mi hogar ${ic('flecha-der', 'size-5 transition-transform group-hover:translate-x-0.5')}</a>`,
  };
};
