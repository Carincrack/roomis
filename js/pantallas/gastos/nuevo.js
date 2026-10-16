/* ---------- D3 · Agregar gasto (reconstruida) ---------- */
P['nuevo-gasto'] = () => {
  const b = S.borradorGasto || (S.borradorGasto = { titulo: '', monto: '', cat: 'carrito', pago: S.yo, entre: [...S.miembros] });
  const cats = [['carrito', 'Compras'], ['wifi', 'Internet'], ['rayo', 'Luz'], ['gota', 'Agua'], ['recibo', 'Otro']];
  const m = Number(b.monto) || 0;
  return {
    ancho: ANCHO.form,
    html: `
      ${encabezado({ titulo: 'Agregar gasto', izq: atras('#/gastos'), der: { icono: 'ayuda', etiqueta: 'Ayuda', accion: 'ayuda', id: 'nuevo' } })}
      <form class="flex flex-col gap-3 md:grid md:grid-cols-2 md:items-start md:gap-x-8 lg:gap-x-12" onsubmit="return false">
        <div class="flex flex-col gap-3">
        <label class="flex flex-col gap-2">
          <span class="text-[12px] font-medium leading-4 sec">Descripción</span>
          <span class="campo"><span class="text-acento-tea">${ic('recibo', 'size-5')}</span>
            <input id="g-titulo" maxlength="40" value="${esc(b.titulo)}" placeholder="Ej. Supermercado" class="min-w-0 flex-1 bg-transparent text-[15px] leading-[22px] outline-none placeholder:text-texto/70" /></span>
        </label>
        <label class="flex flex-col gap-2">
          <span class="text-[12px] font-medium leading-4 sec">Monto</span>
          <span class="campo"><span class="font-serif text-[22px] text-acento-tea">₡</span>
            <input id="g-monto" inputmode="numeric" value="${esc(b.monto)}" placeholder="0" class="min-w-0 flex-1 bg-transparent font-serif text-[24px] font-medium leading-[30px] outline-none placeholder:text-texto/70" /></span>
        </label>
        <p class="micro tenue pt-1">Categoría</p>
        <div class="flex flex-wrap gap-2">${cats.map(([k, t]) => `<button type="button" data-accion="g-cat" data-id="${k}" aria-pressed="${b.cat === k}" class="chip px-3.5 ${b.cat === k ? 'chip-activo' : ''}">${ic(k, 'size-[15px]')}${t}</button>`).join('')}</div>
        </div>
        <div class="flex flex-col gap-3">
        <p class="micro tenue pt-1 md:pt-0">¿Quién pagó?</p>
        <div class="flex gap-4">${S.miembros.map(id => `
          <button type="button" data-accion="g-pago" data-id="${id}" aria-pressed="${b.pago === id}" class="flex flex-col items-center gap-1.5">
            <span class="avatar size-[50px] text-[18px] transition ${b.pago === id ? 'border-[3px] border-acento-tea shadow-[0_0_14px_rgba(11,122,90,0.3)]' : 'opacity-75 hover:opacity-100'}" style="background:${persona(id).color}">${esc(persona(id).ini)}</span>
            <span class="text-[12px] font-medium leading-4 ${b.pago === id ? 'text-acento-tea' : 'sec'}">${nombreCorto(id)}</span>
          </button>`).join('')}</div>
        <p class="micro tenue pt-1">Dividir entre</p>
        <div class="flex flex-col gap-3 rounded-[20px] border border-texto/[0.14] capa p-4">
          ${S.miembros.map((id, i) => `${i ? '<div class="divisor"></div>' : ''}
            <div class="flex items-center gap-3">
              ${avatar(id, 32, 12)}
              <p class="min-w-0 flex-1 text-[15px] font-medium leading-[22px]">${id === S.yo ? 'Tú' : persona(id).nombre}</p>
              <span class="text-[13px] tenue" data-parte="${id}">${b.entre.includes(id) && m ? crc(m / b.entre.length) : '—'}</span>
              ${interruptor(b.entre.includes(id), `g-entre:${id}`, `Incluir a ${persona(id).corto}`)}
            </div>`).join('')}
        </div>
        </div>
      </form>`,
    cta: `<button type="button" data-accion="crear-gasto" class="btn-primario">Agregar gasto${m ? ' · ' + crc(m) : ''}</button>`,
    montar() {
      const t = document.getElementById('g-titulo'), mo = document.getElementById('g-monto');
      t.addEventListener('input', () => { b.titulo = t.value; });
      mo.addEventListener('input', () => {
        b.monto = mo.value.replace(/\D/g, '').slice(0, 8); mo.value = b.monto;
        const v = Number(b.monto) || 0;
        document.querySelectorAll('[data-parte]').forEach(el => { const id = el.dataset.parte; el.textContent = b.entre.includes(id) && v ? crc(v / b.entre.length) : '—'; });
        const btn = document.querySelector('[data-accion="crear-gasto"]'); if (btn) btn.textContent = 'Agregar gasto' + (v ? ' · ' + crc(v) : '');
      });
    },
  };
};
