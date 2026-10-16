/* Acciones: comunes (modales, deshacer, ayuda) */
Object.assign(ACC, {
  'cerrar-modal': (el, e) => { if (el.dataset.forzar !== undefined || e.target === el) cerrarModal(); },
  'modal-aceptar': () => { const fn = alAceptarModal; alAceptarModal = null; cerrarModal(); if (fn) fn(); },
  'deshacer': () => ejecutarDeshacer(),
  'ayuda': el => dialogoAyuda(el.dataset.id),
  'tema': el => { TEMA.elegir(el.dataset.id); refrescar(); },
  'tema-alternar': () => { TEMA.elegir(TEMA.real() === 'claro' ? 'oscuro' : 'claro'); refrescar(); },
  'cerrar-sesion': () => confirmar({
    titulo: '¿Cerrar sesión?', texto: 'Volverás a la pantalla de inicio de sesión. Tus datos del hogar quedan guardados en la nube.', etiqueta: 'Cerrar sesión', icono: 'salir', tono: 'ok',
    alAceptar: async () => { await AUTH.salir(); location.hash = '#/login'; aviso('Sesión cerrada'); },
  }),
});
