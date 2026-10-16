/* Acciones: inicio de sesión */
Object.assign(ACC, {
  'iniciar-sesion': () => {
    const correo = document.getElementById('login-correo'), clave = document.getElementById('login-clave');
    const c = correo.value.trim();
    if (!c) { errorCampo('login-correo', 'Escribe tu correo, por ejemplo andres@correo.com.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c)) { errorCampo('login-correo', 'Ese correo no parece válido. Revisa que tenga @ y un dominio.'); return; }
    if (!clave.value) { errorCampo('login-clave', 'Escribe tu contraseña.'); return; }
    if (clave.value.length < 6) { errorCampo('login-clave', 'La contraseña tiene al menos 6 caracteres.'); return; }
    ir('#/inicio'); aviso(`Bienvenido de nuevo, ${esc(persona(S.yo).corto)}`);
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
    cerrarModal(); aviso(`Enlace enviado a ${esc(c)}`);
  },
  'login-google': () => aviso('Continuar con Google estará disponible pronto', 'alerta'),
});
function accionDinamicaLogin(nombre) {
  if (nombre.startsWith('testimonio:')) return () => {
    const d = Number(nombre.split(':')[1]);
    S.testimonio = (S.testimonio + d + TESTIMONIOS.length) % TESTIMONIOS.length; pintarTestimonio();
  };
}
