/* ---------- Crear cuenta · mismo diseño dividido que el login ---------- */
const PASOS_REGISTRO = [
  ['usuario-mas', 'Crea tu cuenta', 'Solo toma un minuto.'],
  ['casa', 'Crea un hogar o únete a uno', 'Con un código de invitación.'],
  ['tareas', 'Reparte tareas y gastos', 'Sin discusiones ni cuentas pendientes.'],
];
const htmlPasos = () => `
  <h2 class="font-serif text-[30px] font-medium leading-9 text-white xl:text-[34px]">Tu hogar en orden en tres pasos</h2>
  <ol class="flex flex-col gap-4">${PASOS_REGISTRO.map(([ico, t, d], i) => `
    <li class="flex items-center gap-4">
      <span class="grid size-11 shrink-0 place-items-center rounded-full border border-white/50 text-white">${ic(ico, 'size-5')}</span>
      <span class="flex flex-col"><span class="text-[16px] font-semibold text-white">${i + 1}. ${t}</span><span class="text-[14px] text-white/80">${d}</span></span>
    </li>`).join('')}</ol>`;

/* Fuerza de la contraseña: 0 vacía · 1 débil · 2 media · 3 fuerte */
function fuerzaClave(v) {
  if (!v) return 0;
  let p = 0;
  if (v.length >= 8) p++;
  if (/[a-z]/i.test(v) && /\d/.test(v)) p++;
  if (v.length >= 12 || /[^a-z0-9]/i.test(v)) p++;
  return Math.max(1, p);
}
function pintarFuerza(idClave = 'registro-clave') {
  const v = document.getElementById(idClave).value, f = fuerzaClave(v), el = document.getElementById('fuerza-clave');
  const col = ['bg-texto/15', 'bg-peligro', 'bg-alerta', 'bg-acento-teal'][f], txt = ['Mínimo 8 caracteres, con letras y números.', 'Débil: añade más caracteres.', 'Media: añade un símbolo o más longitud.', 'Fuerte'][f];
  el.innerHTML = `<span class="flex gap-1.5" aria-hidden="true">${[1, 2, 3].map(n => `<span class="h-1.5 flex-1 rounded-full ${n <= f ? col : 'bg-texto/15'}"></span>`).join('')}</span><span class="text-[12px] leading-4 ${f === 1 ? 'text-peligro' : 'tenue'}">${txt}</span>`;
}
/* ¿Las dos contraseñas coinciden? Se avisa en vivo con ícono y texto, no solo con color */
function pintarCoincide(idClave = 'registro-clave', idClave2 = 'registro-clave2') {
  const a = document.getElementById(idClave).value, b = document.getElementById(idClave2).value, el = document.getElementById('coincide-clave');
  if (!b) { el.innerHTML = ''; return; }
  el.className = `flex min-h-4 items-center gap-1.5 text-[12px] font-medium leading-4 ${a === b ? 'text-acento-tea' : 'text-peligro'}`;
  el.innerHTML = a === b ? `${ic('check', 'size-3.5', 2.2)}Las contraseñas coinciden` : `${ic('x', 'size-3.5', 2.2)}Todavía no coinciden`;
}

/* Términos de uso y política de privacidad (se leen antes de aceptar) */
const LEGAL = {
  terminos: ['Términos de uso', 'documento', [
    ['Qué es Roomies', 'Roomies es una app para organizar un hogar compartido: repartir tareas, dividir gastos y conversar con tus roomies. Es un proyecto académico del curso Diseño de Interfaces de Usuario (Universidad Nacional, Sede Regional Chorotega).'],
    ['Tu cuenta', 'Eres responsable de lo que se publique desde tu cuenta y de mantener tu contraseña en secreto. Usa tu nombre real para que tus roomies te reconozcan.'],
    ['Hogares y códigos', 'Quien crea un hogar es su administrador: puede aprobar o rechazar solicitudes y quitar miembros. Comparte el código de invitación solo con las personas que viven contigo.'],
    ['Convivencia', 'No publiques contenido ofensivo, discriminatorio o que exponga datos de otras personas en tareas, gastos o el chat del hogar.'],
    ['Gastos', 'Roomies calcula cuánto le toca a cada quien, pero no procesa pagos ni guarda datos bancarios. Los acuerdos de dinero son entre los miembros del hogar.'],
    ['Disponibilidad', 'Al ser un prototipo, el servicio puede cambiar o interrumpirse y los datos podrían borrarse al terminar el curso.'],
  ]],
  privacidad: ['Política de privacidad', 'escudo', [
    ['Qué datos guardamos', 'Tu nombre, tu correo y una contraseña cifrada; además de las tareas, gastos, avisos y mensajes que crees dentro de tu hogar.'],
    ['Quién los ve', 'Solo los miembros aprobados de tu hogar ven sus tareas, gastos y mensajes. El administrador ve el nombre de quien pide unirse. Nadie fuera del hogar puede leerlos.'],
    ['Dónde se guardan', 'En Supabase, con reglas de seguridad por hogar. La contraseña nunca se guarda en texto plano.'],
    ['Para qué se usan', 'Solo para que la app funcione: mostrarte tu hogar, avisarte de vencimientos y sincronizar los cambios en tiempo real. No se venden ni se comparten con terceros.'],
    ['Tus derechos', 'Puedes salir de tu hogar o pedir que eliminemos tu cuenta y tus datos escribiendo al equipo del proyecto.'],
  ]],
};
function dialogoLegal(tema) {
  const [titulo, icono, secciones] = LEGAL[tema];
  abrirModal(`
    <div class="fixed inset-0 z-40 grid place-items-center bg-[rgba(6,16,18,0.55)] p-4 backdrop-blur-[6px] velo-entra" data-accion="cerrar-modal">
      <div role="dialog" aria-modal="true" aria-labelledby="dlg-l-t" class="modal-vidrio dialogo-entra flex max-h-[86dvh] w-full max-w-[520px] flex-col overflow-hidden rounded-[28px]" data-detener>
        <div class="flex items-center gap-3 border-b border-texto/[0.12] px-5 py-4">
          <span class="burbuja size-10">${ic(icono, 'size-5')}</span>
          <h2 id="dlg-l-t" class="h3 flex-1">${titulo}</h2>
          <button type="button" class="btn-icono size-10" data-accion="cerrar-modal" data-forzar aria-label="Cerrar">${ic('x', 'size-5')}</button>
        </div>
        <div class="flex flex-col gap-4 overflow-y-auto px-5 py-4 text-[14px] leading-[21px]" tabindex="0">
          <p class="text-[12px] tenue">Última actualización: 16 de octubre de 2026</p>
          ${secciones.map(([t, d], i) => `<section class="flex flex-col gap-1"><h3 class="text-[15px] font-semibold">${i + 1}. ${t}</h3><p class="sec">${d}</p></section>`).join('')}
        </div>
        <div class="flex gap-2.5 border-t border-texto/[0.12] px-5 py-4">
          <button type="button" class="btn-sec min-h-12 flex-1" data-accion="cerrar-modal" data-forzar>Cerrar</button>
          <button type="button" class="btn-acento min-h-12 flex-1 text-[13px]" data-accion="aceptar-legal">${ic('check', 'size-4', 2.2)}Leí y acepto</button>
        </div>
      </div>
    </div>`, '[data-forzar]');
}

P.registro = () => ({
  completa: true,
  html: `
  <section class="flex min-h-[100dvh] items-center justify-center md:p-6 lg:p-8">
    <div class="grid min-h-[100dvh] w-full max-w-[1280px] bg-transparent md:min-h-[720px] md:rounded-[32px] md:vidrio lg:min-h-[760px] lg:grid-cols-2">
      <div class="flex flex-col px-5 pb-6 pt-8 md:px-12 md:pb-8 md:pt-10 lg:px-14">
        <div class="flex items-center justify-between gap-3">${logoAcceso()}${botonTema()}</div>
        <div class="mx-auto flex w-full max-w-[380px] flex-1 flex-col justify-center gap-4 py-6">
          <div class="flex flex-col gap-2">
            <h1 class="font-serif text-[32px] font-medium leading-10 tracking-[-0.01em] md:text-[36px]">Crea tu cuenta</h1>
            <p class="text-[15px] leading-[22px] sec">Es gratis. Después crearás tu hogar o te unirás a uno.</p>
          </div>
          <form id="form-registro" novalidate class="flex flex-col gap-3 [&_.campo]:!py-3">
            <label class="flex flex-col gap-2">
              <span class="text-[13px] font-medium leading-4">Nombre completo</span>
              <span class="campo">${ic('usuario', 'size-5 text-acento-tea')}
                <input id="registro-nombre" type="text" autocomplete="name" maxlength="60" placeholder="Ej. Andrés Alvarado" class="min-w-0 flex-1 bg-transparent text-[15px] leading-[22px] outline-none placeholder:text-texto/70" />
              </span>
            </label>
            <label class="flex flex-col gap-2">
              <span class="text-[13px] font-medium leading-4">Correo electrónico</span>
              <span class="campo">${ic('correo', 'size-5 text-acento-tea')}
                <input id="registro-correo" type="email" inputmode="email" autocomplete="email" placeholder="tucorreo@ejemplo.com" class="min-w-0 flex-1 bg-transparent text-[15px] leading-[22px] outline-none placeholder:text-texto/70" />
              </span>
            </label>
            <div class="flex flex-col gap-2">
              <label class="flex flex-col gap-2">
                <span class="text-[13px] font-medium leading-4">Contraseña</span>
                <span class="campo">${ic('candado', 'size-5 text-acento-tea')}
                  <input id="registro-clave" type="password" autocomplete="new-password" placeholder="Crea una contraseña" class="min-w-0 flex-1 bg-transparent text-[15px] leading-[22px] outline-none placeholder:text-texto/70" />
                  <button type="button" data-accion="ver-clave" data-campo="registro-clave" aria-label="Mostrar contraseña" aria-pressed="false" class="-mr-2 grid size-10 shrink-0 place-items-center rounded-full text-texto/70 transition hover:bg-texto/[0.06]">${ic('ojo', 'size-5')}</button>
                </span>
              </label>
              <div id="fuerza-clave" class="flex flex-col gap-1.5" aria-live="polite"></div>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="flex flex-col gap-2">
                <span class="text-[13px] font-medium leading-4">Confirmar contraseña</span>
                <span class="campo">${ic('candado', 'size-5 text-acento-tea')}
                  <input id="registro-clave2" type="password" autocomplete="new-password" placeholder="Repite tu contraseña" class="min-w-0 flex-1 bg-transparent text-[15px] leading-[22px] outline-none placeholder:text-texto/70" />
                  <button type="button" data-accion="ver-clave" data-campo="registro-clave2" aria-label="Mostrar contraseña" aria-pressed="false" class="-mr-2 grid size-10 shrink-0 place-items-center rounded-full text-texto/[0.78] transition hover:bg-texto/[0.06]">${ic('ojo', 'size-5')}</button>
                </span>
              </label>
              <p id="coincide-clave" class="flex min-h-4 items-center gap-1.5 text-[12px] font-medium leading-4" aria-live="polite"></p>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="flex cursor-pointer items-start gap-2.5 py-1 text-[14px] leading-5">
                <input id="registro-terminos" type="checkbox" class="mt-0.5 size-5 shrink-0 rounded-md accent-acento-teal" />
                <span>Acepto los <button type="button" data-accion="ver-legal" data-id="terminos" class="font-semibold text-acento-tea underline underline-offset-2">Términos de uso</button> y la <button type="button" data-accion="ver-legal" data-id="privacidad" class="font-semibold text-acento-tea underline underline-offset-2">Política de privacidad</button>.</span>
              </label>
              <p id="err-terminos" role="alert" class="hidden items-center gap-1.5 text-[12px] font-medium leading-4 text-peligro">${ic('alerta', 'size-3.5')}Debes aceptar los términos para crear tu cuenta.</p>
            </div>
            <button type="submit" class="btn-primario">Crear cuenta</button>
            <button type="button" data-accion="login-google" class="btn-vidrio">${GOOGLE}Registrarme con Google</button>
          </form>
          <p class="text-center text-[14px] leading-5 sec">¿Ya tienes cuenta? <a href="#/login" class="font-semibold text-acento-tea hover:underline">Inicia sesión</a></p>
        </div>
        <p class="text-[13px] tenue">© Roomies 2026</p>
      </div>
      ${panelImagen('Cómo empezar con Roomies', 'pasos-registro', htmlPasos())}
    </div>
  </section>`,
  montar() {
    montarFoto(); pintarFuerza();
    document.getElementById('registro-clave').addEventListener('input', () => { pintarFuerza(); pintarCoincide(); });
    document.getElementById('registro-clave2').addEventListener('input', () => pintarCoincide());
    document.getElementById('registro-terminos').addEventListener('change', () => { const e = document.getElementById('err-terminos'); e.classList.add('hidden'); e.classList.remove('flex'); });
    document.getElementById('form-registro').addEventListener('submit', e => { e.preventDefault(); ACC['crear-cuenta'](); });
  },
});
