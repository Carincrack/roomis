const interruptor = (on, accion, etiqueta) => `
  <button type="button" role="switch" aria-checked="${on}" aria-label="${esc(etiqueta)}" data-accion="${accion}"
    class="relative h-7 w-[46px] shrink-0 rounded-full border transition ${on ? 'border-acento-tea/40 bg-acento-teal' : 'border-texto/25 bg-texto/[0.18]'}">
    <span class="absolute top-[2px] size-[22px] rounded-full bg-white shadow transition-all ${on ? 'left-[20px]' : 'left-[2px]'}"></span>
  </button>`;
