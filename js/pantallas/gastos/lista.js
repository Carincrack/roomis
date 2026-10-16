/* ---------- D1 · Gastos compartidos (reconstruida con el sistema de diseño) ---------- */
P.gastos = () => {
  const mes = S.gastos.reduce((s, g) => s + g.monto, 0);
  const miParte = S.gastos.reduce((s, g) => s + (g.entre.includes(S.yo) ? parte(g) : 0), 0);
  const fila = g => {
    const pend = !g.entre.length;
    const yoDebo = g.pago !== S.yo && g.entre.includes(S.yo) && !g.pagados.includes(S.yo);
    const estado = pend ? ['bg-alerta-fondo text-alerta', 'Por dividir']
      : yoDebo ? ['bg-peligro-fondo text-peligro', `Debes ${crc(parte(g))}`]
      : g.pagados.length >= g.entre.length ? ['bg-acento-fondo text-acento-tea', 'Saldado']
      : ['capa text-texto/70', `${g.entre.length - g.pagados.length} por pagar`];
    return `
      <a href="#/gasto/${g.id}" class="flex items-center gap-3 rounded-[20px] border ${yoDebo ? 'border-peligro/35' : pend ? 'border-alerta/35' : 'border-texto/[0.14]'} capa p-3.5 transition hover:bg-velo/[0.09]">
        <span class="burbuja size-10">${ic(g.cat, 'size-[18px]')}</span>
        <span class="flex min-w-0 flex-1 flex-col gap-1.5">
          <span class="truncate text-[16px] font-semibold leading-[22px]">${esc(g.titulo)}</span>
          <span class="flex items-center gap-2"><span class="rounded-[10px] px-2 py-1 text-[12px] font-medium leading-4 ${estado[0]}">${estado[1]}</span><span class="truncate text-[13px] leading-[18px] tenue">Pagó ${nombreCorto(g.pago)}</span></span>
        </span>
        <span class="shrink-0 text-right"><span class="block text-[16px] font-semibold leading-[22px]">${crc(g.monto)}</span><span class="block text-[12px] leading-4 tenue">${cap(diaPalabra(g.fecha))}</span></span>
      </a>`;
  };
  return {
    tab: 'gastos', ancho: ANCHO.app,
    html: `
      ${encabezado({ titulo: 'Gastos compartidos', izq: atras('#/inicio'), der: { icono: 'ayuda', etiqueta: 'Ayuda sobre gastos', accion: 'ayuda', id: 'gastos' } })}
      <div class="grid grid-cols-1 gap-3.5 md:grid-cols-[1fr_1.1fr] md:items-start md:gap-6 lg:grid-cols-[1fr_1.5fr] lg:gap-8">
        <section class="vidrio-fuerte relative flex flex-col gap-3 overflow-hidden rounded-[28px] px-5 pb-[18px] pt-5">
          <span aria-hidden="true" class="pointer-events-none absolute right-[-10px] top-[-10px] text-texto opacity-[0.12]">${ic('billetera', 'size-[140px]', 0.6)}</span>
          <p class="text-[13px] leading-[18px] sec">Total del mes en ${esc(S.hogar.nombre)}</p>
          <h2 class="h1">${crc(mes)}</h2>
          <p class="text-[13px] leading-[18px] sec">Tu parte: <span class="font-medium text-texto">${crc(miParte)}</span></p>
          <div class="grid grid-cols-2 gap-2">
            <div class="flex flex-col rounded-[14px] bg-peligro-fondo px-3 py-2"><span class="text-[16px] font-semibold leading-[22px] text-peligro">${crc(debo())}</span><span class="text-[12px] font-medium leading-4 sec">Debes</span></div>
            <div class="flex flex-col rounded-[14px] bg-acento-fondo px-3 py-2"><span class="text-[16px] font-semibold leading-[22px] text-acento-tea">${crc(meDeben())}</span><span class="text-[12px] font-medium leading-4 sec">Te deben</span></div>
          </div>
        </section>
        <section class="flex flex-col gap-3">
          <div class="flex items-center justify-between"><h2 class="h3">Gastos del mes</h2><span class="text-[12px] font-medium tenue md:hidden">${S.gastos.length} registrados</span><a href="#/nuevo-gasto" class="btn-acento hidden px-4 md:flex">${ic('mas', 'size-4', 2)}Agregar gasto</a></div>
          ${S.gastos.length ? S.gastos.slice().sort((a, b) => b.fecha - a.fecha).map(fila).join('') : `<div class="flex flex-col items-center gap-2 rounded-[22px] border border-texto/[0.14] capa-tenue p-8 text-center"><span class="burbuja size-11">${ic('billetera', 'size-5')}</span><p class="text-[15px] font-medium">Aún no hay gastos</p><p class="text-[13px] leading-[18px] sec">Agrega el primero y se dividirá entre tus roomies.</p><a href="#/nuevo-gasto" class="btn-acento mt-1 min-h-11 px-4">${ic('mas', 'size-4', 2)}Agregar gasto</a></div>`}
        </section>
      </div>`,
    fab: `<a href="#/nuevo-gasto" class="flex items-center gap-2 rounded-[26px] bg-gradient-to-r from-acento-claro to-acento-teal py-3.5 pl-[18px] pr-5 text-[16px] font-semibold leading-5 text-sobre shadow-brillo transition hover:brightness-105 active:scale-[0.98]">${ic('mas', 'size-5', 2)}Agregar gasto</a>`,
  };
};
