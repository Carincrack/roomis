/* Acciones: registro (cuenta real en Supabase Auth) */
Object.assign(ACC, {
  'ver-legal': el => dialogoLegal(el.dataset.id),
  'aceptar-legal': () => {
    cerrarModal();
    const c = document.getElementById('registro-terminos'); if (!c) return;
    c.checked = true; c.dispatchEvent(new Event('change'));
  },
  'crear-cuenta': () => {
    const nombre = document.getElementById('registro-nombre').value.trim(), correo = document.getElementById('registro-correo').value.trim();
    const clave = document.getElementById('registro-clave').value, clave2 = document.getElementById('registro-clave2').value;
    if (nombre.length < 2) { errorCampo('registro-nombre', 'Escribe tu nombre, por ejemplo «Andrés Alvarado».'); return; }
    if (/[<>&"'`]/.test(nombre)) { errorCampo('registro-nombre', 'Usa solo letras y espacios en tu nombre.'); return; }
    if (!correo) { errorCampo('registro-correo', 'Escribe tu correo, por ejemplo andres@correo.com.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) { errorCampo('registro-correo', 'Ese correo no parece válido. Revisa que tenga @ y un dominio.'); return; }
    if (clave.length < 8 || !/[a-z]/i.test(clave) || !/\d/.test(clave)) { errorCampo('registro-clave', 'Usa al menos 8 caracteres, con letras y números.'); return; }
    if (clave2 !== clave) { errorCampo('registro-clave2', 'Las contraseñas no coinciden. Vuelve a escribirla.'); return; }
    if (!document.getElementById('registro-terminos').checked) {
      const e = document.getElementById('err-terminos'); e.classList.remove('hidden'); e.classList.add('flex'); document.getElementById('registro-terminos').focus(); return;
    }
    if (!NUBE.cliente) { aviso('Falta configurar Supabase', 'peligro'); return; }
    const btn = document.querySelector('#form-registro [type="submit"]');
    conCarga(btn, 'Creando cuenta…', async () => {
      try {
        const destino = await AUTH.registrar(nombre, correo, clave);
        location.hash = destino; aviso(`Cuenta creada. ¡Bienvenido, ${esc(nombre.split(' ')[0])}!`);
      } catch (e) {
        if (e.message !== 'confirmar-correo') { errorCampo('registro-correo', mensajeError(e)); return; }
        // La cuenta sí se creó: pasa al login con el correo ya escrito
        location.hash = '#/login';
        setTimeout(() => { const c = document.getElementById('login-correo'); if (c) { c.value = correo; document.getElementById('login-clave')?.focus(); } }, 50);
        aviso('Cuenta creada. Inicia sesión con tu correo y contraseña.');
      }
    });
  },
});
