/* Panel con foto (solo laptop) compartido por login y registro.
   Orden de búsqueda de la foto: img/login.jpg (tu archivo) → enlace de Pinterest → ilustración local */
const FOTO_RESPALDO = ['https://i.pinimg.com/1200x/a3/95/40/a395409bc1c2eef78e80ed0050855ec0.jpg', 'img/login-roomies.svg'];
function panelImagen(etiqueta, idContenido, contenido) {
  return `
      <aside aria-label="${esc(etiqueta)}" class="relative m-3 hidden overflow-hidden rounded-[28px] bg-[#CFE5DA] lg:m-4 lg:flex lg:flex-col lg:justify-end lg:sticky lg:top-4 lg:max-h-[728px] lg:min-h-[560px] lg:self-start lg:rounded-[32px] lg:rounded-tl-[96px] lg:h-[calc(100dvh-5rem)]">
        <img id="foto-panel" src="img/login.jpg" referrerpolicy="no-referrer" alt="Roomies compartiendo su hogar" class="absolute inset-0 size-full object-cover object-center" />
        <div aria-hidden="true" class="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-[#06342A]/90 via-[#06342A]/60 to-transparent"></div>
        <div id="${idContenido}" class="relative flex flex-col gap-6 p-10">${contenido}</div>
      </aside>`;
}
function montarFoto() {
  const foto = document.getElementById('foto-panel'); if (!foto) return;
  let paso = 0;
  foto.addEventListener('error', () => { if (paso < FOTO_RESPALDO.length) foto.src = FOTO_RESPALDO[paso++]; });
}
const GOOGLE = '<svg class="size-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.27-2.09 3.57-5.17 3.57-8.81z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.87-3c-1.07.72-2.44 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.3v3.1A12 12 0 0 0 12 24z"/><path fill="#FBBC05" d="M5.29 14.29A7.2 7.2 0 0 1 4.91 12c0-.8.14-1.57.38-2.29v-3.1H1.3A12 12 0 0 0 0 12c0 1.94.46 3.77 1.3 5.39l3.99-3.1z"/><path fill="#EA4335" d="M12 4.76c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.3 6.61l3.99 3.1C6.23 6.87 8.88 4.76 12 4.76z"/></svg>';
/* Logo y pie comunes de las pantallas de acceso */
const logoAcceso = () => `<a href="#/login" class="flex w-fit items-center gap-3 rounded-xl" aria-label="Roomies"><span class="grid size-11 place-items-center rounded-[14px] bg-gradient-to-br from-acento-claro to-acento-teal text-white shadow-brillo">${ic('roomies', 'size-6', 1.4)}</span><span class="font-serif text-[26px] font-medium">Roomies</span></a>`;
