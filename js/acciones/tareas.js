/* Acciones: tareas */
function refrescarContadores() {
  // Actualiza los números de los filtros de tareas sin perder el foco del buscador
  const mias = S.tareas.filter(t => t.asignado === S.yo).length, pv = pendientes().filter(t => !vencida(t)).length, v = pendientes().filter(vencida).length;
  const m = { todas: `Todas ${S.tareas.length}`, mias: `Mías ${mias}`, 'por-vencer': `Por vencer ${pv}`, vencidas: `Vencidas ${v}` };
  document.querySelectorAll('[data-accion="filtro-tareas"]').forEach(b => b.textContent = m[b.dataset.id]);
}

Object.assign(ACC, {
  'alternar-tarea': el => {
    const t = tarea(el.dataset.id), antes = t.estado;
    t.estado = antes === 'completada' ? 'pendiente' : 'completada';
    if (document.getElementById('lista-tareas')) { pintarListaTareas(); refrescarContadores(); } else refrescar();
    aviso(t.estado === 'completada' ? `“${esc(t.titulo)}” completada` : `“${esc(t.titulo)}” vuelve a pendiente`, 'ok', { deshacer: () => { t.estado = antes; } });
  },
  'filtro-tareas': el => { S.filtroTareas = el.dataset.id; if (location.hash.includes('?')) { history.replaceState(null, '', '#/tareas'); } refrescar(); },
  'asignar': el => { S.borrador.asignado = el.dataset.id; refrescar(); },
  'alerta-borrador': el => { const k = el.dataset.id; S.borrador.alertas[k] = !S.borrador.alertas[k]; refrescar(); },
  'borrador:avisar': () => { S.borrador.avisar = !S.borrador.avisar; refrescar(); },
  'borrador:repetir': () => { S.borrador.repetir = !S.borrador.repetir; refrescar(); },
  'crear-tarea': () => {
    const b = S.borrador, editando = S.editando && tarea(S.editando);
    if (!b.titulo.trim()) { errorCampo('titulo-tarea', 'Escribe un título para la tarea, por ejemplo «Limpiar la cocina».'); return; }
    if (new Date(b.fecha) < Date.now() && !(editando && editando.estado === 'completada')) {
      const e = document.getElementById('err-fecha'); e.classList.remove('hidden'); e.classList.add('flex'); e.scrollIntoView({ block: 'center', behavior: 'smooth' }); return;
    }
    let asignado = b.asignado;
    if (asignado === 'rotar') { const c = {}; S.miembros.forEach(m => c[m] = pendientes().filter(t => t.asignado === m).length); asignado = [...S.miembros].sort((a, z) => c[a] - c[z])[0]; }
    const campos = { titulo: b.titulo.trim(), asignado, vence: new Date(b.fecha), repite: b.repetir, alertas: Object.keys(b.alertas).filter(k => b.alertas[k]), avisar: b.avisar };
    if (editando) {
      const antes = { ...editando }; Object.assign(editando, campos);
      S.borrador = null; S.editando = null; ir('#/tarea/' + editando.id);
      aviso('Cambios guardados', 'ok', { deshacer: () => Object.assign(editando, antes) });
      return;
    }
    const t = { id: uid(), lugar: 'Casa', por: S.yo, estado: 'pendiente', ...campos };
    S.tareas.push(t); S.borrador = null; S.filtroTareas = 'todas';
    ir('#/tareas'); aviso(`Tarea asignada a ${asignado === S.yo ? 'ti' : persona(asignado).corto}`, 'ok', { deshacer: () => { S.tareas = S.tareas.filter(x => x !== t); } });
  },
  'estado-tarea': el => { const t = tarea(ruta().id); t.estado = el.dataset.id; refrescar(); },
  'completar-tarea': el => {
    const t = tarea(el.dataset.id), antes = t.estado; t.estado = 'completada';
    if (el.dataset.quedarse) refrescar(); else ir('#/tareas');
    aviso(`“${esc(t.titulo)}” completada · tu hogar ya lo ve`, 'ok', { deshacer: () => { t.estado = antes; } });
  },
  'opciones-tarea': () => {
    const t = tarea(ruta().id); if (!t) return;
    const op = (icono, txt, attrs, cls = '') => `<button type="button" ${attrs} class="flex min-h-12 w-full items-center gap-3 rounded-2xl border border-texto/[0.14] capa px-4 text-left text-[15px] font-medium transition hover:bg-velo/[0.1] ${cls}">${ic(icono, 'size-5')}${txt}</button>`;
    abrirModal(dialogoBase({ id: 'dlg-o', icono: 'mas-opciones', titulo: 'Opciones de la tarea',
      cuerpo: `<p class="mb-3 truncate">${esc(t.titulo)}</p><div class="flex flex-col gap-2">${op('editar', 'Editar tarea', `data-ir="#/editar-tarea/${t.id}"`)}${op('papelera', 'Eliminar tarea', `data-accion="eliminar-tarea" data-id="${t.id}"`, 'text-peligro')}</div>`,
      acciones: '<button type="button" class="btn-sec min-h-12 flex-1 p-3.5" data-accion="cerrar-modal" data-forzar>Cerrar</button>' }), '[data-ir]');
  },
  'eliminar-tarea': el => {
    const t = tarea(el.dataset.id); cerrarModal();
    confirmar({
      titulo: '¿Eliminar esta tarea?', texto: `“${esc(t.titulo)}” se quitará para todo el hogar.`, etiqueta: 'Eliminar', icono: 'papelera',
      alAceptar: () => { const i = S.tareas.indexOf(t); S.tareas.splice(i, 1); ir('#/tareas'); aviso('Tarea eliminada', 'ok', { deshacer: () => S.tareas.splice(i, 0, t) }); },
    });
  },
});
