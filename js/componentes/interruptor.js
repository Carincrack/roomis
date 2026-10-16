const interruptor = (on, accion, etiqueta) => `
  <button type="button" role="switch" aria-checked="${on}" aria-label="${esc(etiqueta)}" data-accion="${accion}"
    class="relative h-7 w-[46px] shrink-0 rounded-full border transition ${on ? 'border-acento-tea/40 bg-acento-teal' : 'border-white/15 bg-black/25 shadow-[inset_0_1px_3px_rgba(0,0,0,.35)]'}">
    <span class="absolute top-[2px] size-[22px] rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,.35),inset_0_-1px_0_rgba(0,0,0,.08)] transition-[left] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${on ? 'left-[20px]' : 'left-[2px]'}"></span>
  </button>`;
