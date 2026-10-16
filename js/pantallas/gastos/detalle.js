/* ---------- D2 · Detalle de gasto (reconstruida) ---------- */
P.gasto = (q, id) => {
  const g = gasto(id);
  if (!g) return P.gastos(q);
  const yoDebo = g.pago !== S.yo && g.entre.includes(S.yo) && !g.pagados.includes(S.yo);
  const filaP = (pid, i) => {
    const pagado = g.pagados.includes(pid), esPagador = pid === g.pago;
    return `${i ? '<div class="divisor"></div>' : ''}
      <div class="flex items-center gap-3">
        ${avatar(pid, 36, 13)}
        <div class="flex min-w-0 flex-1 flex-col"><p class="text-[15px] font-medium leading-[22px]">${pid === S.yo ? 'Tú' : persona(pid).nombre}</p><p class="text-[13px] leading-[18px] tenue">${esPagador ? 'Pagó el total' : `Parte: ${crc(parte(g))}`}</p></div>
        <span class="rounded-[10px] px-2 py-1 text-[12px] font-medium leading-4 ${pagado ? 'bg-acento-fondo text-acento-tea' : 'bg-alerta-fondo text-alerta'}">${pagado ? (esPagador ? 'Pagó' : 'Pagado') : 'Pendiente'}</span>
      </div>`;
  };
  return {
    ancho: ANCHO.form,
    html: `
      ${encabezado({ titulo: 'Detalle de gasto', izq: atras('#/gastos') })}
      <div class="flex flex-col gap-3 md:grid md:grid-cols-2 md:items-start md:gap-x-8 lg:gap-x-12">
        <section class="vidrio-fuerte flex flex-col items-center gap-2 rounded-[28px] px-5 py-6 text-center">
          <span class="burbuja size-[58px]">${ic(g.cat, 'size-[26px]')}</span>
          <p class="text-[15px] font-medium sec">${esc(g.titulo)}</p>
          <h2 class="font-serif text-[40px] font-medium leading-[46px] tracking-[-0.2px]">${crc(g.monto)}</h2>
          <p class="flex items-center gap-1.5 text-[13px] leading-[18px] tenue">${ic('calendario', 'size-[14px]')}${cap(diaPalabra(g.fecha))}, ${g.fecha.getDate()} ${MESES[g.fecha.getMonth()]} · pagó ${nombreCorto(g.pago) === 'Tú' ? 'tú' : persona(g.pago).corto}</p>
        </section>
        <div class="flex flex-col gap-3">
        ${g.entre.length ? `
          <p class="micro tenue pt-1 md:pt-0">Dividido entre ${g.entre.length} · ${crc(parte(g))} c/u</p>
          <div class="vidrio flex flex-col gap-3 rounded-[22px] p-4">${g.entre.map(filaP).join('')}</div>`
        : `<div class="flex items-center gap-3 rounded-[22px] border border-alerta/35 capa p-4">
             <span class="grid size-10 shrink-0 place-items-center rounded-full bg-alerta-fondo text-alerta">${ic('alerta', 'size-[18px]')}</span>
             <p class="flex-1 text-[13px] leading-[18px] sec">Este gasto aún no se ha dividido entre el hogar.</p>
             <button type="button" class="btn-acento" data-accion="dividir-gasto" data-id="${g.id}">Dividir</button>
           </div>`}
        </div>
      </div>`,
    cta: yoDebo ? `<button type="button" class="btn-primario" data-accion="pagar-gasto" data-id="${g.id}">Pagar mi parte · ${crc(parte(g))}</button>` : '',
  };
};
