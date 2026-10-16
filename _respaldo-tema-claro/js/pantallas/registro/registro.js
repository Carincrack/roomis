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
function pintarFuerza() {
  const v = document.getElementById('registro-clave').value, f = fuerzaClave(v), el = document.getElementById('fuerza-clave');
  const col = ['bg-texto/15', 'bg-peligro', 'bg-alerta', 'bg-acento-teal'][f], txt = ['Mínimo 8 caracteres, con letras y números.', 'Débil: añade más caracteres.', 'Media: añade un símbolo o más longitud.', 'Fuerte'][f];
  el.innerHTML = `<span class="flex gap-1.5" aria-hidden="true">${[1, 2, 3].map(n => `<span class="h-1.5 flex-1 rounded-full ${n <= f ? col : 'bg-texto/15'}"></span>`).join('')}</span><span class="text-[12px] leading-4 ${f === 1 ? 'text-peligro' : 'tenue'}">${txt}</span>`;
}

P.registro = () => ({
  completa: true,
  html: `
  <section class="flex min-h-[100dvh] items-center justify-center md:p-6 lg:p-8">
    <div class="grid min-h-[100dvh] w-full max-w-[1280px] bg-white/70 md:min-h-[720px] md:rounded-[32px] md:border md:border-texto/[0.1] md:shadow-vidrio md:backdrop-blur-[12px] lg:min-h-[760px] lg:grid-cols-2 lg:bg-white/80">
      <div class="flex flex-col px-5 pb-6 pt-8 md:px-12 md:pb-8 md:pt-10 lg:px-14">
        ${logoAcceso()}
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
            <label class="flex flex-col gap-2">
              <span class="text-[13px] font-medium leading-4">Confirmar contraseña</span>
              <span class="campo">${ic('candado', 'size-5 text-acento-tea')}
                <input id="registro-clave2" type="password" autocomplete="new-password" placeholder="Repite tu contraseña" class="min-w-0 flex-1 bg-transparent text-[15px] leading-[22px] outline-none placeholder:text-texto/70" />
              </span>
            </label>
            <div class="flex flex-col gap-1.5">
              <label class="flex cursor-pointer items-start gap-2.5 py-1 text-[14px] leading-5">
                <input id="registro-terminos" type="checkbox" class="mt-0.5 size-5 shrink-0 rounded-md accent-[#0B7A5A]" />
                <span>Acepto los <strong class="font-semibold">Términos de uso</strong> y la <strong class="font-semibold">Política de privacidad</strong>.</span>
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
    document.getElementById('registro-clave').addEventListener('input', pintarFuerza);
    document.getElementById('registro-terminos').addEventListener('change', () => { const e = document.getElementById('err-terminos'); e.classList.add('hidden'); e.classList.remove('flex'); });
    document.getElementById('form-registro').addEventListener('submit', e => { e.preventDefault(); ACC['crear-cuenta'](); });
  },
});
