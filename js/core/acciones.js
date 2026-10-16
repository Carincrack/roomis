/* Registro de acciones (data-accion) y delegación de clics */
const ACC = {};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-accion], [data-ir]');
  if (!el) return;
  if (el.hasAttribute('data-detener') && !e.target.closest('[data-accion]')) return;
  if (el.dataset.ir) { e.preventDefault(); cerrarModal(); el.dataset.ir === 'atras' ? history.back() : ir(el.dataset.ir); return; }
  const fn = ACC[el.dataset.accion] || accionDinamica(el.dataset.accion);
  if (fn) { e.preventDefault(); fn(el, e); programarSync(); }
});
