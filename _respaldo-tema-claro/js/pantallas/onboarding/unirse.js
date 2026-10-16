/* ---------- A5 · Unirse con código ---------- */
P.unirse = () => {
  const cod = S.codigoIngresado;
  const completo = cod.every(Boolean);
  const valido = completo && cod.join('') === S.hogar.codigo;
  const cajas = cod.map((ch, i) => `
    <input type="text" inputmode="text" autocomplete="one-time-code" maxlength="1" value="${esc(ch)}" data-otp="${i}" aria-label="Carácter ${i + 1} de 6"
      class="h-[58px] w-full min-w-0 rounded-[14px] border bg-white/[0.7] text-center font-serif text-[24px] font-medium uppercase leading-[30px] outline-none transition focus:border-[1.5px] focus:border-acento-teal ${completo && !valido ? 'border-peligro/60' : 'border-texto/[0.14]'}" />`).join('');
  const p = S.personas;
  return {
    html: `
      ${encabezado({ titulo: 'Unirme a un hogar', izq: atras('#/crear-o-unirse'), der: { icono: 'ayuda', etiqueta: 'Ayuda', accion: 'ayuda', id: 'unirse' } })}
      <div class="flex flex-col gap-4 pt-3">
        <h2 class="h1">Ingresa el código</h2>
        <p class="text-[15px] leading-[22px] sec">Pídele el código de invitación al administrador de tu hogar.</p>
        <div class="grid grid-cols-6 gap-2 xs:gap-[9px]" id="otp">${cajas}</div>
        <div id="resultado-codigo">
        ${valido ? `
          <div class="vidrio flex flex-col gap-3.5 rounded-3xl p-[18px]">
            <p class="micro flex items-center gap-1.5 text-acento-teal">${ic('check', 'size-3.5', 2.2)}Hogar encontrado</p>
            <div class="flex items-center gap-3.5">
              <span class="burbuja size-[50px]">${ic('casa', 'size-[23px]')}</span>
              <div class="flex min-w-0 flex-1 flex-col gap-0.5">
                <p class="h3">${esc(S.hogar.nombre)}</p>
                <p class="text-[13px] leading-[18px] tenue">${esc(S.hogar.ubicacion)}</p>
              </div>
            </div>
            <div class="divisor"></div>
            <div class="flex items-center gap-3">
              <div class="flex -space-x-2.5">${['AA','BF','JG'].map(id => avatar(id, 32, 12)).join('')}</div>
              <p class="flex-1 text-[13px] leading-[18px] sec">3 miembros · Administra ${p.AA.corto}</p>
            </div>
          </div>` : completo ? `
          <div class="flex items-center gap-3 rounded-3xl border border-peligro/40 bg-peligro/[0.08] p-[18px]">
            <span class="grid size-10 shrink-0 place-items-center rounded-full bg-peligro/[0.16] text-peligro">${ic('alerta', 'size-[18px]')}</span>
            <p class="text-[13px] leading-[18px] sec">No encontramos un hogar con ese código. Revisa que esté bien escrito (prueba con <span class="font-medium text-texto">4B7K2Q</span>).</p>
          </div>` : ''}
        </div>
        <p class="flex gap-2.5 pl-1 text-[13px] leading-[18px] tenue"><span class="text-acento-tea">${ic('escudo', 'size-[18px]')}</span>Podrás ver tareas y gastos cuando el administrador acepte tu solicitud.</p>
      </div>`,
    cta: `<button type="button" data-accion="enviar-solicitud" class="btn-primario group" ${valido ? '' : 'disabled'}>Enviar solicitud ${ic('flecha-der', 'size-5 transition-transform group-hover:translate-x-0.5')}</button>`,
    montar() {
      const cajas = [...document.querySelectorAll('[data-otp]')];
      const sync = () => { S.codigoIngresado = cajas.map(c => c.value.toUpperCase()); };
      cajas.forEach((c, i) => {
        c.addEventListener('input', () => {
          c.value = c.value.replace(/[^a-z0-9]/gi, '').slice(-1).toUpperCase();
          sync();
          if (c.value && i < 5) cajas[i + 1].focus();
          if (S.codigoIngresado.every(Boolean) || !c.value) refrescar({ foco: c.value ? null : i });
        });
        c.addEventListener('keydown', e => {
          if (e.key === 'Backspace' && !c.value && i > 0) { cajas[i - 1].focus(); }
          if (e.key === 'ArrowLeft' && i > 0) cajas[i - 1].focus();
          if (e.key === 'ArrowRight' && i < 5) cajas[i + 1].focus();
        });
        c.addEventListener('paste', e => {
          const t = (e.clipboardData.getData('text') || '').replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 6);
          if (!t) return; e.preventDefault();
          S.codigoIngresado = Array.from({ length: 6 }, (_, k) => t[k] || '');
          refrescar({ foco: Math.min(t.length, 5) });
        });
        c.addEventListener('focus', () => c.select());
      });
    },
  };
};
