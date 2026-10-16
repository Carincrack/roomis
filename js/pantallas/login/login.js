/* ---------- Iniciar sesión · formulario + panel con testimonio ---------- */
const TESTIMONIOS = [
  { texto: 'Desde que usamos Roomies nadie se queda con el baño sin limpiar. Todo está claro y ya no discutimos.', autor: 'Valeria Mora', rol: 'Apto 3C', lugar: 'San José' },
  { texto: 'Dividir el internet y la luz dejó de ser una charla incómoda. Cada quien ve lo que le toca.', autor: 'Diego Salas', rol: 'Casa Los Almendros', lugar: 'Heredia' },
  { texto: 'Los avisos antes de que venza una tarea nos salvaron más de una vez. Vivir juntos es más fácil.', autor: 'Camila Rojas', rol: 'Residencias Norte', lugar: 'Alajuela' },
];

function htmlTestimonio() {
  const t = TESTIMONIOS[S.testimonio];
  return `
    <blockquote class="font-serif text-[24px] font-medium leading-[1.3] text-white xl:text-[28px]">“${esc(t.texto)}”</blockquote>
    <div class="flex items-end justify-between gap-4">
      <div class="flex flex-col gap-0.5"><p class="text-[17px] font-semibold text-white">${esc(t.autor)}</p><p class="text-[14px] text-white/80">${esc(t.rol)} · ${esc(t.lugar)}</p></div>
      <div class="flex gap-3">
        <button type="button" data-accion="testimonio:-1" aria-label="Testimonio anterior" class="grid size-11 place-items-center rounded-full border border-white/60 text-white transition hover:bg-white/15">${ic('atras', 'size-5')}</button>
        <button type="button" data-accion="testimonio:1" aria-label="Testimonio siguiente" class="grid size-11 place-items-center rounded-full border border-white/60 text-white transition hover:bg-white/15">${ic('flecha-der', 'size-5')}</button>
      </div>
    </div>`;
}
function pintarTestimonio() { const el = document.getElementById('testimonio'); if (el) el.innerHTML = htmlTestimonio(); }

P.login = () => ({
  completa: true,
  html: `
  <section class="flex min-h-[100dvh] items-center justify-center md:p-6 lg:p-8">
    <div class="grid min-h-[100dvh] w-full max-w-[1280px] bg-transparent md:min-h-[720px] md:rounded-[32px] md:vidrio lg:min-h-[760px] lg:grid-cols-2">
      <div class="flex flex-col px-5 pb-6 pt-8 md:px-12 md:pb-8 md:pt-10 lg:px-14">
        <div class="flex items-center justify-between gap-3">${logoAcceso()}${botonTema()}</div>
        <div class="mx-auto flex w-full max-w-[380px] flex-1 flex-col justify-center gap-6 py-10">
          <div class="flex flex-col gap-2">
            <h1 class="font-serif text-[32px] font-medium leading-10 tracking-[-0.01em] md:text-[36px]">Bienvenido de nuevo</h1>
            <p class="text-[15px] leading-[22px] sec">Entra para ver las tareas y los gastos de tu hogar.</p>
          </div>
          ${NUBE.listo && NUBE.estado === 'local' ? `
          <p class="flex items-start gap-2.5 rounded-2xl border border-alerta/40 bg-alerta/[0.08] p-3.5 text-[13px] leading-[18px] sec" role="alert">
            <span class="text-alerta">${ic('alerta', 'size-[18px]')}</span>Falta la clave de Supabase en <code class="text-texto">js/config/supabase-config.js</code>. Sin ella no se puede iniciar sesión.</p>` : `
          <button type="button" data-accion="cuenta-prueba" class="flex items-center gap-3 rounded-2xl border border-texto/[0.12] capa p-3 text-left transition hover:bg-velo/[0.09] active:scale-[0.98]">
            <span class="avatar size-9 text-[13px]" style="background:#B7D3BC">BF</span>
            <span class="flex min-w-0 flex-1 flex-col"><span class="text-[14px] font-medium">Usar la cuenta de prueba</span><span class="truncate text-[12px] tenue">bairon@roomies.cr · sin hogar todavía</span></span>
            <span class="tenue">${ic('chevron', 'size-[18px]')}</span>
          </button>`}
          <form id="form-login" novalidate class="flex flex-col gap-4">
            <label class="flex flex-col gap-2">
              <span class="text-[13px] font-medium leading-4">Correo electrónico</span>
              <span class="campo">${ic('correo', 'size-5 text-acento-tea')}
                <input id="login-correo" type="email" inputmode="email" autocomplete="email" placeholder="tucorreo@ejemplo.com" class="min-w-0 flex-1 bg-transparent text-[15px] leading-[22px] outline-none placeholder:text-texto/70" />
              </span>
            </label>
            <label class="flex flex-col gap-2">
              <span class="text-[13px] font-medium leading-4">Contraseña</span>
              <span class="campo">${ic('candado', 'size-5 text-acento-tea')}
                <input id="login-clave" type="password" autocomplete="current-password" placeholder="Tu contraseña" class="min-w-0 flex-1 bg-transparent text-[15px] leading-[22px] outline-none placeholder:text-texto/70" />
                <button type="button" data-accion="ver-clave" data-campo="login-clave" aria-label="Mostrar contraseña" aria-pressed="false" class="-mr-2 grid size-10 shrink-0 place-items-center rounded-full text-texto/[0.78] transition hover:bg-texto/[0.06]">${ic('ojo', 'size-5')}</button>
              </span>
            </label>
            <div class="flex items-center justify-between gap-3">
              <label class="flex min-h-10 cursor-pointer items-center gap-2.5 text-[14px] leading-5">
                <input id="login-recordar" type="checkbox" checked class="size-5 rounded-md accent-acento-teal" />Recordarme por 30 días
              </label>
              <button type="button" data-accion="olvide-clave" class="min-h-10 text-[14px] font-semibold text-acento-tea hover:underline">¿Olvidaste tu contraseña?</button>
            </div>
            <button type="submit" id="btn-entrar" class="btn-primario group">Iniciar sesión ${ic('flecha-der', 'size-5 transition-transform duration-200 group-hover:translate-x-0.5')}</button>
            <button type="button" data-accion="login-google" class="btn-vidrio">${GOOGLE}Continuar con Google</button>
          </form>
          <p class="text-center text-[14px] leading-5 sec">¿Aún no tienes cuenta? <a href="#/registro" class="font-semibold text-acento-tea hover:underline">Regístrate</a></p>
        </div>
        <p class="text-[13px] tenue">© Roomies 2026</p>
      </div>

      ${panelImagen('Lo que dicen otros roomies', 'testimonio', htmlTestimonio())}
    </div>
  </section>`,
  montar() {
    montarFoto();
    document.getElementById('form-login').addEventListener('submit', e => { e.preventDefault(); ACC['iniciar-sesion'](); });
    document.getElementById('login-correo').focus({ preventScroll: true });
  },
});
