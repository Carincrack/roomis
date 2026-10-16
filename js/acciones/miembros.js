/* Acciones: miembros */
Object.assign(ACC, {
  'pedir-rechazo': el => dialogoRechazo(el.dataset.id),
  'confirmar-rechazo': el => {
    const id = el.dataset.id, i = S.solicitudes.findIndex(s => s.id === id), sol = S.solicitudes[i];
    S.solicitudes.splice(i, 1);
    cerrarModal(); refrescar();
    aviso(`Solicitud de ${persona(id).corto} rechazada`, 'peligro', { deshacer: () => S.solicitudes.splice(i, 0, sol) });
  },
  'aceptar': el => {
    const id = el.dataset.id, i = S.solicitudes.findIndex(s => s.id === id), sol = S.solicitudes[i];
    S.solicitudes.splice(i, 1); S.miembros.push(id); S.nuevos.push(id); refrescar();
    aviso(`${persona(id).nombre} ya es parte de ${esc(S.hogar.nombre)}`, 'ok', {
      deshacer: () => { S.miembros = S.miembros.filter(m => m !== id); S.nuevos = S.nuevos.filter(m => m !== id); S.solicitudes.splice(i, 0, sol); },
    });
  },
  'opciones-miembro': el => {
    const id = el.dataset.id, p = persona(id);
    confirmar({
      titulo: `¿Quitar a ${p.nombre}?`,
      texto: `Dejará de ver las tareas y gastos de ${esc(S.hogar.nombre)}. Sus tareas pendientes pasarán a ti.`,
      etiqueta: 'Quitar del hogar', icono: 'usuario',
      alAceptar: () => {
        const pos = S.miembros.indexOf(id), movidas = S.tareas.filter(t => t.asignado === id && t.estado !== 'completada');
        S.miembros.splice(pos, 1); movidas.forEach(t => t.asignado = S.yo); refrescar();
        aviso(`${p.corto} ya no está en el hogar`, 'alerta', { deshacer: () => { S.miembros.splice(pos, 0, id); movidas.forEach(t => t.asignado = id); } });
      },
    });
  },
});
