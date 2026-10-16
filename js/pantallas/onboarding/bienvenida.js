/* ---------- A1 · Bienvenida ---------- */
P.bienvenida = () => ({
  completa: true,
  html: `
  <section class="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-4 py-10 xs:px-8">
    <span aria-hidden="true" class="pointer-events-none absolute -z-10 bottom-[-10%] left-[-18%] w-[115vw] max-w-[760px] text-texto opacity-5 md:left-[-4%] md:w-[60vw]">${ic('roomies', 'w-full h-auto', 0.35)}</span>
    <div class="vidrio entrada flex w-full max-w-[311px] flex-col items-center gap-3.5 rounded-[36px] px-[26px] pb-[34px] pt-[46px] text-center sm:max-w-[380px] sm:px-10 sm:pb-10 sm:pt-14 lg:max-w-[420px] lg:rounded-[40px]">
      <span class="text-acento-tea">${ic('roomies', 'size-[58px] sm:size-[66px]', 1.1)}</span>
      <h1 class="font-serif text-[40px] font-medium leading-[1.13] tracking-[-0.01em] xs:text-[46px] sm:text-[52px] lg:text-[56px]">Roomies</h1>
      <p class="font-serif text-[16px] italic leading-[22px] text-acento-teal xs:text-[17px] sm:text-[18px]">Vivir juntos, sin enredos</p>
      <div class="h-1"></div>
      <p class="max-w-[240px] text-[15px] leading-[22px] sec sm:text-[16px] sm:leading-6">Tareas claras.<br>Gastos justos.<br>Un hogar en paz.</p>
      <div class="h-2.5"></div>
      <a href="#/crear-o-unirse" class="btn-primario group">Empezar ${ic('flecha-der', 'size-5 transition-transform group-hover:translate-x-0.5')}</a>
      <p class="text-[13px] leading-[18px] sec sm:text-[14px]">Hola, ${esc(persona(S.yo).corto)} · <button type="button" data-accion="cerrar-sesion" class="rounded font-medium text-acento-tea hover:underline">No soy yo</button></p>
    </div>
    <div class="mt-[30px] flex items-center gap-2" aria-hidden="true">
      <span class="h-[7px] w-5 rounded bg-acento-tea"></span><span class="size-[7px] rounded bg-texto/20"></span><span class="size-[7px] rounded bg-texto/20"></span>
    </div>
  </section>`,
});
