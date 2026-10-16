const avatar = (id, size = 42, txt = 15) =>
  `<span class="avatar" style="width:${size}px;height:${size}px;background:${persona(id).color};font-size:${txt}px" title="${esc(persona(id).nombre)}">${esc(persona(id).ini)}</span>`;
