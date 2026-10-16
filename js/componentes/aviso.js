/* Aviso flotante (toast) con acción opcional «Deshacer» (heurística 3) */
let timerAviso, deshacerPendiente = null;
function aviso(texto, tono = 'ok', opciones = {}) {
  const el = document.getElementById('aviso');
  const col = tono === 'ok' ? 'bg-acento-tea text-sobre' : tono === 'alerta' ? 'bg-alerta text-sobre' : 'bg-peligro text-sobre';
  el.className = el.className.replace(/border-(acento-teal|alerta|peligro)/, tono === 'ok' ? 'border-acento-teal' : tono === 'alerta' ? 'border-alerta' : 'border-peligro');
  deshacerPendiente = opciones.deshacer || null;
  el.innerHTML = `<span class="grid size-[26px] shrink-0 place-items-center rounded-full ${col}">${ic(tono === 'ok' ? 'check' : tono === 'alerta' ? 'campana' : 'x', 'size-3.5', 2.2)}</span><span class="text-[15px] font-medium leading-[22px]">${texto}</span>${deshacerPendiente ? `<button type="button" data-accion="deshacer" class="pointer-events-auto ml-1 flex min-h-10 items-center gap-1.5 rounded-xl px-2.5 text-[14px] font-semibold text-acento-tea underline-offset-2 hover:bg-texto/[0.06]">${ic('deshacer', 'size-4')}Deshacer</button>` : ''}`;
  el.classList.remove('opacity-0', 'translate-y-3');
  clearTimeout(timerAviso);
  timerAviso = setTimeout(ocultarAviso, deshacerPendiente ? 6500 : 3200);
}
function ocultarAviso() {
  const el = document.getElementById('aviso');
  el.classList.add('opacity-0', 'translate-y-3'); deshacerPendiente = null;
  setTimeout(() => { if (el.classList.contains('opacity-0')) el.innerHTML = ''; }, 350);
}
function ejecutarDeshacer() {
  const fn = deshacerPendiente; if (!fn) return;
  clearTimeout(timerAviso); ocultarAviso(); fn(); refrescar();
  aviso('Cambio deshecho');
}
