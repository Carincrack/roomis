/* ---------- Crear una contraseña nueva · se llega con el enlace de «¿Olvidaste tu contraseña?» ---------- */
const campoClave = (id, etiqueta, ayuda) => `
  <label class="flex flex-col gap-2">
    <span class="text-[13px] font-medium leading-4">${etiqueta}</span>
    <span class="campo">${ic('candado', 'size-5 text-acento-tea')}
      <input id="${id}" type="password" autocomplete="new-password" placeholder="${ayuda}" class="min-w-0 flex-1 bg-transparent text-[15px] leading-[22px] outline-none placeholder:text-texto/70" />
      <button type="button" data-accion="ver-clave" data-campo="${id}" aria-label="Mostrar contraseña" aria-pressed="false" class="-mr-2 grid size-10 shrink-0 place-items-center rounded-full text-texto/[0.78] transition hover:bg-texto/[0.06]">${ic('ojo', 'size-5')}</button>
    </span>
  </label>`;

P['nueva-clave'] = () => ({
  completa: true,
  html: `
  <section class="flex min-h-[100dvh] items-center justify-center md:p-6 lg:p-8">
    <div class="grid min-h-[100dvh] w-full max-w-[1280px] bg-transparent md:min-h-[720px] md:rounded-[32px] md:vidrio lg:min-h-[760px] lg:grid-cols-2">
      <div class="flex flex-col px-5 pb-6 pt-8 md:px-12 md:pb-8 md:pt-10 lg:px-14">
        <div class="flex items-center justify-between gap-3">${logoAcceso()}${botonTema()}</div>
        <div class="mx-auto flex w-full max-w-[380px] flex-1 flex-col justify-center gap-6 py-10">
          <div class="flex flex-col gap-2">
            <h1 class="font-serif text-[32px] font-medium leading-10 tracking-[-0.01em] md:text-[36px]">Crea una contraseña nueva</h1>
            <p class="break-words text-[15px] leading-[22px] sec">Para la cuenta ${esc(NUBE.sesion?.user?.email || '')}.</p>
          </div>
          <form id="form-clave" novalidate class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
              ${campoClave('nueva-clave', 'Contraseña nueva', 'Crea una contraseña')}
              <div id="fuerza-clave" class="flex flex-col gap-1.5" aria-live="polite"></div>
            </div>
            <div class="flex flex-col gap-1.5">
              ${campoClave('nueva-clave2', 'Confirmar contraseña', 'Repite tu contraseña')}
              <p id="coincide-clave" class="flex min-h-4 items-center gap-1.5 text-[12px] font-medium leading-4" aria-live="polite"></p>
            </div>
            <button type="submit" id="btn-clave" class="btn-primario">Guardar contraseña</button>
            <button type="button" data-accion="cancelar-clave" class="btn-vidrio">Cancelar</button>
          </form>
        </div>
        <p class="text-[13px] tenue">© Roomies 2026</p>
      </div>
      ${panelImagen('Lo que dicen otros roomies', 'testimonio', htmlTestimonio())}
    </div>
  </section>`,
  montar() {
    const coincide = () => pintarCoincide('nueva-clave', 'nueva-clave2');
    montarFoto(); pintarFuerza('nueva-clave');
    document.getElementById('nueva-clave').addEventListener('input', () => { pintarFuerza('nueva-clave'); coincide(); });
    document.getElementById('nueva-clave2').addEventListener('input', coincide);
    document.getElementById('form-clave').addEventListener('submit', e => { e.preventDefault(); ACC['guardar-clave'](); });
    document.getElementById('nueva-clave').focus({ preventScroll: true });
  },
});
