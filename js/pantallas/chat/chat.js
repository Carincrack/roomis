/* ---------- Chat del hogar · mensajes, presencia y «escribiendo» en tiempo real ---------- */
const CINCO_MIN = 5 * 6e4;

function htmlMensajes() {
  if (!S.mensajes.length) return `
    <div class="flex flex-col items-center gap-2 rounded-[22px] border border-texto/[0.14] capa-tenue p-8 text-center">
      <span class="burbuja size-11">${ic('chat', 'size-5')}</span>
      <p class="text-[15px] font-medium">Todavía no hay mensajes</p>
      <p class="text-[13px] tenue">Escribe el primero: tus roomies lo verán al instante.</p>
    </div>`;
  let html = '', diaPrevio = '';
  S.mensajes.forEach((m, i) => {
    const prev = S.mensajes[i - 1], sig = S.mensajes[i + 1];
    const dia = m.creado.toDateString();
    if (dia !== diaPrevio) {
      diaPrevio = dia;
      const p = diaPalabra(m.creado), etiqueta = ['hoy', 'ayer', 'mañana'].includes(p) ? cap(p) : diaCorto(m.creado);
      html += `<p class="my-2 self-center rounded-full border border-texto/[0.12] capa-tenue px-3 py-1 text-[12px] font-medium tenue">${etiqueta}</p>`;
    }
    const inicioGrupo = !prev || prev.autor !== m.autor || m.creado - prev.creado > CINCO_MIN || prev.creado.toDateString() !== dia;
    const finGrupo = !sig || sig.autor !== m.autor || sig.creado - m.creado > CINCO_MIN || sig.creado.toDateString() !== dia;
    const mio = m.autor === S.yo, p = persona(m.autor);
    const texto = `<p class="whitespace-pre-wrap break-words text-[15px] leading-[21px]">${esc(m.texto)}</p>`;
    const horaTxt = finGrupo ? `<span class="mt-0.5 block text-right text-[11px] leading-4 ${mio ? 'text-sobre/70' : 'tenue'}">${hora(m.creado)}</span>` : '';
    if (mio) {
      html += `
        <div class="flex justify-end ${inicioGrupo ? 'mt-2' : ''}">
          <div class="max-w-[80%] rounded-[20px] ${finGrupo ? 'rounded-br-md' : ''} border border-white/50 bg-gradient-to-br from-acento-claro to-acento-teal px-3.5 py-2 text-sobre shadow-[inset_0_1px_0_rgba(255,255,255,.65),0_8px_20px_-12px_rgba(158,193,163,.7)]">
            <span class="sr-only">Tú dijiste:</span>${texto}${horaTxt}
          </div>
        </div>`;
    } else {
      html += `
        <div class="flex items-end gap-2 ${inicioGrupo ? 'mt-2' : ''}">
          ${finGrupo ? avatar(m.autor, 30, 11) : '<span class="w-[30px] shrink-0"></span>'}
          <div class="flex max-w-[80%] flex-col gap-1">
            ${inicioGrupo ? `<span class="pl-1 text-[12px] font-medium leading-4 text-acento-tea">${esc(p.corto)}</span>` : ''}
            <div class="vidrio rounded-[20px] ${finGrupo ? 'rounded-bl-md' : ''} px-3.5 py-2"><span class="sr-only">${esc(p.corto)} dijo:</span>${texto}${horaTxt}</div>
          </div>
        </div>`;
    }
  });
  return html;
}

function htmlPresencia() {
  const vivo = NUBE.estado === 'en-vivo';
  const online = id => id === S.yo ? vivo : NUBE.enLinea.has(id);
  const otros = S.miembros.filter(id => id !== S.yo && online(id)).map(id => persona(id).corto);
  const texto = !vivo ? 'Los mensajes se guardan en este dispositivo'
    : otros.length ? `${otros.length === 1 ? otros[0] : otros.slice(0, -1).join(', ') + ' y ' + otros.at(-1)} en línea`
    : 'Solo tú en línea ahora';
  return `
    <div class="flex -space-x-2">${S.miembros.map(id => `<span class="relative">${avatar(id, 30, 11)}${online(id) ? '<span class="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-fondo-mid bg-acento-teal"></span>' : ''}</span>`).join('')}</div>
    <p class="min-w-0 flex-1 truncate text-[13px] leading-[18px] sec">${texto}</p>
    ${pildoraNube('chat')}`;
}

function htmlEscribiendo() {
  const quien = Object.keys(NUBE.escribiendo).filter(id => id !== S.yo && S.personas[id]).map(id => persona(id).corto);
  if (!quien.length) return '';
  return `<span class="inline-flex items-center gap-2 rounded-full border border-texto/[0.12] capa px-3 py-1.5 text-[12px] font-medium sec">
    <span class="flex gap-1" aria-hidden="true">${[0, 1, 2].map(i => `<span class="punto-escribe size-1.5 rounded-full bg-acento-tea" style="animation-delay:${i * 160}ms"></span>`).join('')}</span>
    ${quien.join(' y ')} ${quien.length > 1 ? 'están' : 'está'} escribiendo…</span>`;
}

const cercaDelFinal = () => innerHeight + scrollY >= document.documentElement.scrollHeight - 220;
const alFinal = (suave = false) => scrollTo({ top: document.documentElement.scrollHeight, behavior: suave ? 'smooth' : 'auto' });

/* Repinta solo la conversación (no toca el campo donde escribes) */
function pintarChat(forzarFinal = false) {
  const lista = document.getElementById('lista-chat'); if (!lista) return;
  const seguir = forzarFinal || cercaDelFinal();
  lista.innerHTML = htmlMensajes();
  if (seguir) requestAnimationFrame(() => alFinal(true));
}
/* La nube los llama cuando llega un mensaje o cambia la presencia */
function chatRecibido() { if (!document.getElementById('lista-chat')) return false; pintarChat(); return true; }
function chatPresencia() {
  const p = document.getElementById('presencia-chat'); if (p) p.innerHTML = htmlPresencia();
  const e = document.getElementById('escribiendo'); if (e) e.innerHTML = htmlEscribiendo();
}

P.chat = () => {
  S.chatSinLeer = 0;
  return {
    tab: 'chat', ancho: ANCHO.lectura,
    html: `
      ${encabezado({ titulo: 'Chat del hogar', der: { icono: 'usuarios', etiqueta: 'Miembros del hogar', ir: '#/miembros' } })}
      <div id="presencia-chat" class="vidrio mb-3 flex items-center gap-3 rounded-[20px] px-3.5 py-2.5">${htmlPresencia()}</div>
      <div id="lista-chat" role="log" aria-live="polite" aria-label="Mensajes de ${esc(S.hogar.nombre)}" class="flex flex-col gap-1 pb-28 md:pb-4">${htmlMensajes()}</div>`,
    pie: `
      <div class="fixed inset-x-4 bottom-[calc(max(16px,env(safe-area-inset-bottom))+84px)] z-20 mx-auto flex max-w-[520px] flex-col gap-2 md:sticky md:inset-x-auto md:bottom-6 md:mx-0 md:max-w-none md:pt-2">
        <div id="escribiendo" class="min-h-0">${htmlEscribiendo()}</div>
        <form id="form-chat" class="vidrio-fuerte flex items-center gap-2 rounded-[28px] py-1.5 pl-4 pr-1.5">
          <label for="msg-chat" class="sr-only">Escribe un mensaje para tu hogar</label>
          <input id="msg-chat" type="text" autocomplete="off" maxlength="1000" enterkeyhint="send" placeholder="Escribe a tu hogar…"
            class="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] leading-[22px] outline-none placeholder:text-texto/70" />
          <button type="submit" id="btn-enviar" aria-label="Enviar mensaje" disabled
            class="btn-primario !h-11 !w-11 shrink-0 !rounded-full !px-0">${ic('enviar', 'size-5', 2)}</button>
        </form>
      </div>`,
    montar() {
      const form = document.getElementById('form-chat'), input = document.getElementById('msg-chat'), btn = document.getElementById('btn-enviar');
      input.addEventListener('input', () => { btn.disabled = !input.value.trim(); if (input.value.trim()) anunciarEscribiendo(); });
      form.addEventListener('submit', e => {
        e.preventDefault();
        const texto = input.value.trim(); if (!texto) return;
        S.mensajes.push({ id: uid(), autor: S.yo, texto, creado: new Date() });
        input.value = ''; btn.disabled = true; input.focus();
        pintarChat(true); programarSync();
      });
      requestAnimationFrame(() => alFinal());
    },
  };
};
