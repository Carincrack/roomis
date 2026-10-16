/* Acciones: avisos */
Object.assign(ACC, {
  'filtro-avisos': el => { S.filtroAvisos = el.dataset.id; refrescar(); },
  'leer-avisos': () => { S.sinLeer = false; refrescar(); aviso('Todo marcado como leído'); },
  'recordar': el => aviso(`Le recordamos a ${persona(el.dataset.id).corto}`, 'alerta'),
});
