/* Modal accesible: devuelve el foco al cerrar, atrapa Tab y cierra con Escape */
let focoPrevio = null;
function abrirModal(html, enfocar = '[data-forzar], button') {
  const capa = document.getElementById('capa-modal');
  focoPrevio = document.activeElement;
  capa.innerHTML = html;
  const el = capa.querySelector(enfocar); if (el) el.focus();
}
function cerrarModal() {
  const capa = document.getElementById('capa-modal');
  if (!capa.innerHTML) return;
  capa.innerHTML = '';
  if (focoPrevio && document.contains(focoPrevio)) focoPrevio.focus();
  focoPrevio = null;
}
document.addEventListener('keydown', e => {
  if (e.key !== 'Tab') return;
  const dlg = document.querySelector('#capa-modal [role="alertdialog"], #capa-modal [role="dialog"]');
  if (!dlg) return;
  const f = [...dlg.querySelectorAll('button, a[href], input, [tabindex]:not([tabindex="-1"])')].filter(x => !x.disabled);
  if (!f.length) return;
  const a = f[0], z = f[f.length - 1];
  if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
  else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
});

/* Estructura común de los diálogos */
function dialogoBase({ id, icono, tono = 'ok', titulo, cuerpo, acciones }) {
  const col = tono === 'peligro' ? 'bg-peligro/[0.14] text-peligro' : tono === 'alerta' ? 'bg-alerta/[0.14] text-alerta' : 'bg-acento-teal/[0.16] text-acento-tea';
  return `
    <div class="fixed inset-0 z-40 grid place-items-center bg-[rgba(6,16,18,0.55)] p-6 backdrop-blur-[6px] velo-entra" data-accion="cerrar-modal">
      <div role="alertdialog" aria-modal="true" aria-labelledby="${id}-t" aria-describedby="${id}-d"
        class="flex max-h-[90dvh] w-full max-w-[340px] flex-col items-center gap-3 overflow-y-auto rounded-[30px] modal-vidrio px-[22px] pb-[22px] pt-[26px] text-center dialogo-entra" data-detener>
        <span class="grid size-[58px] place-items-center rounded-full ${col}">${ic(icono, 'size-[27px]')}</span>
        <h2 id="${id}-t" class="h2">${titulo}</h2>
        <div id="${id}-d" class="text-[14px] leading-5 sec">${cuerpo}</div>
        <div class="h-1"></div>
        <div class="flex w-full gap-2.5">${acciones}</div>
      </div>
    </div>`;
}
const BTN_CANCELAR = '<button type="button" class="btn-sec min-h-12 flex-1 p-3.5" data-accion="cerrar-modal" data-forzar>Cancelar</button>';

/* Confirmación genérica para acciones destructivas o irreversibles */
let alAceptarModal = null;
function confirmar({ titulo, texto, etiqueta = 'Confirmar', icono = 'alerta', tono = 'peligro', alAceptar }) {
  alAceptarModal = alAceptar;
  const btn = tono === 'peligro'
    ? 'border border-peligro/50 bg-peligro text-sobre'
    : 'bg-gradient-to-r from-acento-claro to-acento-teal text-sobre';
  abrirModal(dialogoBase({ id: 'dlg-c', icono, tono, titulo, cuerpo: texto, acciones: `
    ${BTN_CANCELAR}
    <button type="button" class="flex min-h-12 flex-1 items-center justify-center gap-1.5 rounded-[14px] p-3.5 text-[13px] font-semibold leading-4 transition hover:brightness-105 active:scale-[0.98] ${btn}" data-accion="modal-aceptar">${etiqueta}</button>` }));
}

/* Ayuda contextual (heurística 10) */
const AYUDA = {
  hogar:  ['Crear un hogar', ['Ponle un nombre que tus roomies reconozcan.', 'Tú serás el administrador y aprobarás quién entra.', 'Al terminar recibirás un código para invitar a los demás.']],
  unirse: ['Unirte con un código', ['El código tiene 6 caracteres, letras y números.', 'Puedes pegarlo completo en la primera casilla.', 'El administrador debe aprobar tu solicitud antes de que veas el hogar.']],
  tareas: ['Cómo funcionan las tareas', ['Toca el cuadro de una tarea para marcarla como hecha.', 'Si te equivocas, usa «Deshacer» en el aviso que aparece.', 'Usa los filtros y el buscador para encontrar tareas por persona o estado.']],
  nueva:  ['Crear y asignar tareas', ['Elige a quién se asigna o usa «Rotar» para repartirla de forma justa.', 'Las alertas te recuerdan antes de que venza.', 'Con «Repetir» la tarea vuelve cada semana.']],
  gastos: ['Cómo se dividen los gastos', ['Cada gasto se reparte en partes iguales entre las personas elegidas.', 'Quien pagó ya tiene su parte saldada.', 'Marca «Pagar mi parte» cuando le devuelvas el dinero a quien pagó.']],
  nfc:    ['Etiquetas NFC', ['Pega una etiqueta en cada lugar: cocina, baño, basurero…', 'Acerca la parte de atrás del teléfono y Roomies abre las tareas de ese lugar.', 'Si marcas algo por error, usa «Deshacer» en el aviso que aparece.']],
  nuevo:  ['Agregar un gasto', ['Escribe qué se compró y el monto total en colones.', 'Indica quién pagó y entre quiénes se divide.', 'Cada persona verá cuánto le toca antes de guardar.']],
};
function dialogoAyuda(tema) {
  const [titulo, pasos] = AYUDA[tema] || AYUDA.tareas;
  abrirModal(dialogoBase({ id: 'dlg-a', icono: 'ayuda', titulo,
    cuerpo: `<ul class="flex flex-col gap-2 text-left">${pasos.map(p => `<li class="flex gap-2.5"><span class="mt-0.5 text-acento-tea">${ic('check', 'size-4', 2.2)}</span><span>${p}</span></li>`).join('')}</ul>`,
    acciones: '<button type="button" class="btn-primario h-12 text-[15px]" data-accion="cerrar-modal" data-forzar>Entendido</button>' }));
}

/* Errores en línea junto al campo (heurística 9) */
function errorCampo(id, msg) {
  const i = document.getElementById(id); if (!i) return;
  const wrap = i.closest('label') || i.parentElement;
  let p = wrap.querySelector('[data-error]');
  if (!p) { p = document.createElement('span'); p.dataset.error = ''; p.id = 'err-' + id; p.setAttribute('role', 'alert'); p.className = 'flex items-center gap-1.5 text-[12px] font-medium leading-4 text-peligro'; wrap.appendChild(p); }
  p.innerHTML = ic('alerta', 'size-3.5') + esc(msg);
  i.setAttribute('aria-invalid', 'true'); i.setAttribute('aria-describedby', p.id);
  wrap.querySelector('.campo')?.classList.add('!border-peligro');
  i.focus();
  i.addEventListener('input', () => {
    i.removeAttribute('aria-invalid'); i.removeAttribute('aria-describedby'); p.remove();
    wrap.querySelector('.campo')?.classList.remove('!border-peligro');
  }, { once: true });
}
