/* =========================================================================
   UTILIDADES
   ========================================================================= */
const H = 36e5, D = 864e5;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const crc = n => '₡' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const DIAS = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const MESES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
function hora(d) { const h = d.getHours(), m = String(d.getMinutes()).padStart(2, '0'); return `${h % 12 || 12}:${m} ${h < 12 ? 'a' : 'p'}. m.`; }
function mismoDia(a, b) { return a.toDateString() === b.toDateString(); }
function diaPalabra(d) {
  const hoy = new Date(), man = new Date(Date.now() + D);
  if (mismoDia(d, hoy)) return 'hoy';
  if (mismoDia(d, man)) return 'mañana';
  if (mismoDia(d, new Date(Date.now() - D))) return 'ayer';
  return DIAS[d.getDay()];
}
function diaCorto(d) { return cap(DIAS[d.getDay()].slice(0, 3)) + ' ' + d.getDate() + ' ' + MESES[d.getMonth()]; }
function relativo(d) {
  const diff = d - Date.now(), a = Math.abs(diff);
  const t = a < H ? `${Math.max(1, Math.round(a / 6e4))} min` : a < D ? `${Math.round(a / H)} h` : `${Math.round(a / D)} d`;
  return { pasado: diff < 0, texto: t };
}
function saludo() { const h = new Date().getHours(); return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'; }
function proximoSabado() { const d = new Date(); d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7)); d.setHours(18, 0, 0, 0); return d; }

