document.addEventListener('keydown', e => { if (e.key === 'Escape' && document.getElementById('capa-modal').innerHTML) cerrarModal(); });
window.addEventListener('hashchange', () => render());
render();
iniciarNube();
