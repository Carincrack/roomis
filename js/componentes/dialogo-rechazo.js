/* Diálogo de confirmación para rechazar una solicitud (B2) */
function dialogoRechazo(id) {
  const p = persona(id), s = S.solicitudes.find(x => x.id === id);
  abrirModal(dialogoBase({ id: 'dlg-r', icono: 'x', tono: 'peligro', titulo: `¿Rechazar a ${p.nombre}?`,
    cuerpo: `No podrá entrar a ${esc(S.hogar.nombre)} con esta solicitud. Si cambias de opinión, podrás compartirle un código nuevo.
      <p class="mx-auto mt-3 flex w-fit items-center gap-2 rounded-[14px] bg-texto/[0.06] px-3 py-2 text-[12px] font-medium leading-4">${avatar(id, 24, 9)}${p.nombre} · solicitó ${s ? 'hace ' + relativo(s.creado).texto : ''}</p>`,
    acciones: `${BTN_CANCELAR}
      <button type="button" class="flex min-h-12 flex-1 items-center justify-center gap-1.5 rounded-[14px] border border-peligro/50 bg-peligro p-3.5 text-[13px] font-semibold leading-4 text-sobre transition hover:brightness-105 active:scale-[0.98]" data-accion="confirmar-rechazo" data-id="${id}">${ic('x', 'size-4', 2)}Rechazar</button>` }));
}
