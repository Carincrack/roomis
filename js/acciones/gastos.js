/* Acciones: gastos */
Object.assign(ACC, {
  'pagar-gasto': el => { const g = gasto(el.dataset.id); g.pagados.push(S.yo); refrescar(); aviso(`Pagaste tu parte de ${esc(g.titulo)}`, 'ok', { deshacer: () => { g.pagados = g.pagados.filter(p => p !== S.yo); } }); },
  'dividir-gasto': el => { const g = gasto(el.dataset.id), antes = g.entre; g.entre = [...S.miembros]; refrescar(); aviso(`${esc(g.titulo)} dividido entre ${g.entre.length}`, 'ok', { deshacer: () => { g.entre = antes; } }); },
  'g-cat': el => { S.borradorGasto.cat = el.dataset.id; refrescar(); },
  'g-pago': el => { S.borradorGasto.pago = el.dataset.id; refrescar(); },
  'crear-gasto': () => {
    const b = S.borradorGasto, m = Number(b.monto) || 0;
    if (!b.titulo.trim()) { errorCampo('g-titulo', 'Describe el gasto, por ejemplo «Supermercado».'); return; }
    if (!m) { errorCampo('g-monto', 'Ingresa un monto mayor a ₡0.'); return; }
    const g = { id: uid(), titulo: b.titulo.trim(), cat: b.cat, monto: m, pago: b.pago, entre: [...b.entre], pagados: [b.pago], fecha: new Date() };
    S.gastos.push(g);
    S.avisos.unshift({ id: uid(), cat: 'gastos', tipo: 'gasto', gasto: g.id, hora: new Date() });
    const na = S.avisos[0];
    S.borradorGasto = null; ir('#/gastos');
    aviso(`${esc(g.titulo)} agregado · ${crc(m)}`, 'ok', { deshacer: () => { S.gastos = S.gastos.filter(x => x !== g); S.avisos = S.avisos.filter(x => x !== na); } });
  },
});

// Acciones con prefijo (interruptores por miembro en D3)
function accionDinamica(nombre) {
  if (nombre.startsWith('testimonio:')) return accionDinamicaLogin(nombre);
  if (nombre.startsWith('g-entre:')) return () => {
    const id = nombre.split(':')[1], b = S.borradorGasto;
    b.entre = b.entre.includes(id) ? b.entre.filter(x => x !== id) : [...b.entre, id];
    if (!b.entre.length) { b.entre = [id]; aviso('Al menos una persona debe pagar', 'alerta'); }
    refrescar();
  };
}
