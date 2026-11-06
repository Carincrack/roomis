/* Acciones: inicio de sesión */
Object.assign(ACC, {
  'iniciar-sesion': () => {
    const correo = document.getElementById('login-correo').value.trim(), clave = document.getElementById('login-clave').value;
    if (!correo) { errorCampo('login-correo', 'Escribe tu correo, por ejemplo bairon@roomies.cr.'); return; }
    if (!clave) { errorCampo('login-clave', 'Escribe tu contraseña.'); return; }
    if (!NUBE.cliente) { aviso('Falta configurar Supabase', 'peligro'); return; }
    conCarga(document.getElementById('btn-entrar'), 'Entrando…', async () => {
      try {
        const destino = await AUTH.entrar(correo, clave);
        location.hash = tomarVuelta(destino);
        aviso(`Hola, ${esc(persona(S.yo).corto)}`);
      } catch (e) { errorCampo('login-clave', mensajeError(e)); }
    });
  },
  'cuenta-prueba': () => {
    document.getElementById('login-correo').value = 'bairon@roomies.cr';
    document.getElementById('login-clave').value = 'roomies2026';
    ACC['iniciar-sesion']();
  },
  'ver-clave': el => {
    const i = document.getElementById(el.dataset.campo || 'login-clave'), ver = i.type === 'password';
    i.type = ver ? 'text' : 'password';
    el.setAttribute('aria-pressed', String(ver)); el.setAttribute('aria-label', ver ? 'Ocultar contraseña' : 'Mostrar contraseña');
    el.innerHTML = ic(ver ? 'ojo-off' : 'ojo', 'size-5');
    i.focus();
  },
  'olvide-clave': () => {
    const previo = document.getElementById('login-correo')?.value.trim() || '';
    abrirModal(dialogoBase({ id: 'dlg-p', icono: 'candado', titulo: 'Recupera tu contraseña',
      cuerpo: `<p class="mb-3">Escribe tu correo y te enviaremos un enlace para crear una nueva.</p>
        <label class="flex flex-col gap-2 text-left"><span class="text-[13px] font-medium text-texto">Correo electrónico</span>
          <span class="campo">${ic('correo', 'size-5 text-acento-tea')}<input id="recuperar-correo" type="email" inputmode="email" autocomplete="email" value="${esc(previo)}" placeholder="tucorreo@ejemplo.com" class="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-texto/70" /></span></label>`,
      acciones: `${BTN_CANCELAR}<button type="button" class="btn-acento min-h-12 flex-1 p-3.5 text-[13px] font-semibold" data-accion="enviar-recuperacion">Enviar enlace</button>` }), '#recuperar-correo');
  },
  'enviar-recuperacion': () => {
    const c = document.getElementById('recuperar-correo').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c)) { errorCampo('recuperar-correo', 'Escribe un correo válido para enviarte el enlace.'); return; }
    if (!NUBE.cliente) { aviso('Falta configurar Supabase', 'peligro'); return; }
    NUBE.cliente.auth.resetPasswordForEmail(c, { redirectTo: SUPABASE_CONFIG.sitio }).then(({ error }) => {
      if (error) { errorCampo('recuperar-correo', /email rate limit/i.test(error.message) ? 'Ya se enviaron varios correos. Espera un rato e inténtalo de nuevo.' : mensajeError(error)); return; }
      S.enlaceVencido = false; cerrarModal(); refrescar(); aviso(`Si existe una cuenta con ${esc(c)}, te llegará un enlace para cambiar la contraseña.`);
    });
  },
  'guardar-clave': () => {
    const clave = document.getElementById('nueva-clave').value, clave2 = document.getElementById('nueva-clave2').value;
    if (clave.length < 8 || !/[a-z]/i.test(clave) || !/\d/.test(clave)) { errorCampo('nueva-clave', 'Usa al menos 8 caracteres, con letras y números.'); return; }
    if (clave2 !== clave) { errorCampo('nueva-clave2', 'Las contraseñas no coinciden. Vuelve a escribirla.'); return; }
    conCarga(document.getElementById('btn-clave'), 'Guardando…', async () => {
      try { await AUTH.cambiarClave(clave); location.hash = '#/inicio'; aviso('Contraseña actualizada'); }
      catch (e) { errorCampo('nueva-clave', mensajeError(e)); }
    });
  },
  'cancelar-clave': async () => { await AUTH.salir(); location.hash = '#/login'; },
  'login-google': () => aviso('Continuar con Google estará disponible pronto', 'alerta'),
});
function accionDinamicaLogin(nombre) {
  if (nombre.startsWith('testimonio:')) return () => {
    const d = Number(nombre.split(':')[1]);
    S.testimonio = (S.testimonio + d + TESTIMONIOS.length) % TESTIMONIOS.length; pintarTestimonio();
  };
}
