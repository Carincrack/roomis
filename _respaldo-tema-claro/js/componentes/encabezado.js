function encabezado({ titulo, izq = null, der = null }) {
  const hueco = '<span class="size-11 shrink-0"></span>';
  const boton = b => b ? `<button type="button" class="btn-icono" aria-label="${esc(b.etiqueta)}" ${b.ir ? `data-ir="${b.ir}"` : ''} ${b.accion ? `data-accion="${b.accion}"` : ''} ${b.id ? `data-id="${b.id}"` : ''}>${ic(b.icono, 'size-5')}${b.punto ? '<span class="absolute ml-[18px] mt-[-16px] size-[9px] rounded-full border border-fondo-top bg-alerta"></span>' : ''}</button>` : hueco;
  return `
    <header class="sticky top-0 z-20 -mx-5 bg-gradient-to-b from-fondo-top/90 to-fondo-top/0 px-5 pb-3 pt-seguro backdrop-blur-[6px] md:static md:mx-0 md:bg-none md:px-0 md:pb-5 md:pt-8 md:[backdrop-filter:none]">
      <div class="flex h-11 items-center justify-between gap-3 md:h-auto md:justify-start md:gap-4">
        ${boton(izq)}
        <h1 class="h3 truncate text-center md:flex-1 md:text-left md:text-[28px] md:leading-9 lg:text-[30px]">${titulo}</h1>
        ${boton(der)}
      </div>
    </header>`;
}
const atras = (ir) => ({ icono: 'atras', etiqueta: 'Volver', ir: ir || 'atras' });
