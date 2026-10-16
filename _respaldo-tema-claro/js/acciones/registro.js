/* Acciones: registro */
Object.assign(ACC, {
  'crear-cuenta': () => {
    const nombre = document.getElementById('registro-nombre').value.trim(), correo = document.getElementById('registro-correo').value.trim();
    const clave = document.getElementById('registro-clave').value, clave2 = document.getElementById('registro-clave2').value;
    if (nombre.length < 2) { errorCampo('registro-nombre', 'Escribe tu nombre, por ejemplo «Andrés Alvarado».'); return; }
    if (!correo) { errorCampo('registro-correo', 'Escribe tu correo, por ejemplo andres@correo.com.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) { errorCampo('registro-correo', 'Ese correo no parece válido. Revisa que tenga @ y un dominio.'); return; }
    if (clave.length < 8 || !/[a-z]/i.test(clave) || !/\d/.test(clave)) { errorCampo('registro-clave', 'Usa al menos 8 caracteres, con letras y números.'); return; }
    if (clave2 !== clave) { errorCampo('registro-clave2', 'Las contraseñas no coinciden. Vuelve a escribirla.'); return; }
    if (!document.getElementById('registro-terminos').checked) {
      const e = document.getElementById('err-terminos'); e.classList.remove('hidden'); e.classList.add('flex'); document.getElementById('registro-terminos').focus(); return;
    }
    ir('#/bienvenida'); aviso(`Cuenta creada. ¡Bienvenido, ${esc(nombre.split(' ')[0])}!`);
  },
});
