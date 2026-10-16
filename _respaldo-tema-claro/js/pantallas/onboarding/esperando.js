/* ---------- A6 · Esperando aprobación ---------- */
P.esperando = () => {
  const enviada = S.solicitudEnviada || new Date();
  const paso = (ok, titulo, desc) => `
    <div class="flex items-center gap-3">
      ${ok ? `<span class="grid size-7 shrink-0 place-items-center rounded-full bg-acento-tea text-sobre">${ic('check', 'size-[15px]', 2.2)}</span>`
           : `<span class="grid size-7 shrink-0 place-items-center rounded-full border border-alerta/60 bg-alerta/[0.16] text-alerta">${ic('reloj', 'size-[15px]')}</span>`}
      <div class="flex min-w-0 flex-1 flex-col gap-0.5">
        <p class="text-[15px] font-medium leading-[22px] ${ok ? '' : 'text-alerta'}">${titulo}</p>
        <p class="text-[13px] leading-[18px] tenue">${desc}</p>
      </div>
    </div>`;
  return {
    html: `
      ${encabezado({ titulo: 'Solicitud enviada', der: { icono: 'x', etiqueta: 'Cerrar', ir: '#/login' } })}
      <div class="flex flex-col items-center gap-3.5 pt-2 text-center">
        <div class="relative grid size-[150px] place-items-center" aria-hidden="true">
          <span class="pulso absolute inset-0 rounded-full border border-alerta/25 bg-alerta/[0.04]"></span>
          <span class="pulso pulso-2 absolute inset-4 rounded-full border border-alerta/30 bg-alerta/[0.06]"></span>
          <span class="relative grid size-[84px] place-items-center rounded-full border border-acento-tea/25 bg-alerta/[0.16] text-alerta">${ic('reloj', 'size-9', 1.6)}</span>
        </div>
        <h2 class="h1">Esperando aprobación</h2>
        <p class="max-w-[300px] text-[15px] leading-[22px] sec">${S.personas.AA.corto}, administrador de ${esc(S.hogar.nombre)}, recibió tu solicitud. Te avisaremos apenas responda.</p>
        <div class="vidrio flex w-full flex-col gap-4 rounded-3xl p-[18px] text-left">
          ${paso(true, 'Código validado', `${esc(S.hogar.nombre)} · ${S.hogar.codigo}`)}
          ${paso(true, 'Solicitud enviada', `${cap(diaPalabra(enviada))}, ${hora(enviada)}`)}
          ${paso(false, 'Aprobación del administrador', 'Pendiente · normalmente toma unas horas')}
        </div>
      </div>`,
    cta: `<button type="button" data-accion="cancelar-solicitud" class="btn-vidrio">Cancelar solicitud</button>`,
  };
};
