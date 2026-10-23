/* Acciones: etiquetas NFC (simular el toque, leer y grabar etiquetas reales, registrar desde el lugar) */
let timerNfc = null, lectorNfc = null;

function dialogoNfc(l, titulo, texto) {
  return `
    <div class="fixed inset-0 z-40 grid place-items-center bg-[rgba(6,16,18,0.55)] p-6 backdrop-blur-[6px] velo-entra" data-accion="nfc-cancelar">
      <div role="dialog" aria-modal="true" aria-labelledby="dlg-nfc-t" aria-describedby="nfc-estado"
        class="flex w-full max-w-[340px] flex-col items-center gap-2.5 rounded-[30px] modal-vidrio px-[22px] pb-[22px] pt-[22px] text-center dialogo-entra" data-detener>
        ${l ? escenaNfc(l, 'acercar') : escenaNfc(LUGARES[0], 'quieto')}
        <h2 id="dlg-nfc-t" class="h2">${titulo}</h2>
        <p id="nfc-estado" aria-live="polite" class="flex min-h-10 items-center justify-center gap-1.5 text-[14px] leading-5 sec">${texto}</p>
        <button type="button" class="btn-sec min-h-12 w-full p-3.5" data-accion="nfc-cancelar" data-forzar>Cancelar</button>
      </div>
    </div>`;
}
function detenerNfc() { clearTimeout(timerNfc); if (lectorNfc) { lectorNfc.abort(); lectorNfc = null; } }
const nfcAbierto = () => !!document.getElementById('nfc-estado');

/* Lo que pasa al leer una etiqueta (real o simulada): vibra y abre el lugar */
function abrirLugar(l) {
  navigator.vibrate?.([24, 60, 24]);
  S.nfcToque = true;
  ir('#/nfc/' + l.id);
}
function lugarDeMensaje(msg) {
  for (const r of msg.records) {
    if (r.recordType !== 'url' && r.recordType !== 'text') continue;
    const m = new TextDecoder(r.encoding || 'utf-8').decode(r.data).match(/#\/nfc\/([a-z]+)/);
    if (m && lugarDe(m[1])) return lugarDe(m[1]);
  }
  return null;
}
function errorNfc(e) {
  if (e.name === 'AbortError') return;
  aviso(e.name === 'NotAllowedError' ? 'Permite el acceso a NFC para usar etiquetas' : e.name === 'NotSupportedError' ? 'Este teléfono no tiene NFC o está apagado' : 'No se pudo usar la etiqueta. Intenta de nuevo.', 'alerta');
}

function completarDesdeEtiqueta(t, rapido = false) {
  const antes = t.estado, de = t.asignado !== S.yo ? t.asignado : null;
  t.estado = 'completada';
  const av = { id: uid(), cat: 'tareas', tipo: 'nfc', tarea: t.id, persona: S.yo, hora: new Date() };
  S.avisos.unshift(av);
  navigator.vibrate?.(30);
  refrescar();
  aviso(`${rapido ? 'Marcada al tocar: ' : ''}“${esc(t.titulo)}”${de ? ` de ${esc(persona(de).corto)}` : ''} hecha · tu hogar ya lo ve`, 'ok',
    { deshacer: () => { t.estado = antes; S.avisos = S.avisos.filter(a => a !== av); } });
}

Object.assign(ACC, {
  'nfc-simular': el => {
    const l = lugarDe(el.dataset.id); if (!l) return;
    const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
    detenerNfc();
    abrirModal(dialogoNfc(l, `Etiqueta ${delLugar(l)}`, 'Acercando el teléfono…'), '[data-forzar]');
    timerNfc = setTimeout(() => {
      if (!nfcAbierto()) return;
      document.getElementById('nfc-estado').innerHTML = `<span class="text-acento-tea">${ic('check', 'size-4', 2.4)}</span><span class="font-medium text-texto">Etiqueta leída</span>`;
      timerNfc = setTimeout(() => { if (nfcAbierto()) { cerrarModal(); abrirLugar(l); } }, quieto ? 250 : 420);
    }, quieto ? 350 : 1050);
  },
  'nfc-cancelar': (el, e) => { if (el.dataset.forzar !== undefined || e.target === el) { detenerNfc(); cerrarModal(); } },
  'nfc-leer': async () => {
    if (!NFC_REAL) { aviso('Este navegador no lee NFC', 'alerta'); return; }
    detenerNfc();
    const ctrl = new AbortController(), lector = new NDEFReader();
    try {
      await lector.scan({ signal: ctrl.signal });
      lectorNfc = ctrl;
      abrirModal(dialogoNfc(null, 'Acerca el teléfono', 'Pon la parte de atrás del teléfono sobre la etiqueta.'), '[data-forzar]');
      lector.onreadingerror = () => { if (nfcAbierto()) document.getElementById('nfc-estado').textContent = 'No se pudo leer. Sostén el teléfono quieto un segundo.'; };
      lector.onreading = e => {
        const l = lugarDeMensaje(e.message);
        if (!nfcAbierto()) { detenerNfc(); return; }
        if (!l) { document.getElementById('nfc-estado').textContent = 'Esa etiqueta no es de Roomies. Prueba con otra.'; return; }
        detenerNfc(); cerrarModal(); abrirLugar(l);
      };
    } catch (e) { errorNfc(e); }
  },
  'nfc-grabar': async el => {
    const l = lugarDe(el.dataset.id); if (!l || !NFC_REAL) return;
    detenerNfc();
    const ctrl = new AbortController(); lectorNfc = ctrl;
    abrirModal(dialogoNfc(l, `Grabar etiqueta ${delLugar(l)}`, 'Acerca una etiqueta vacía o reutilizable.'), '[data-forzar]');
    try {
      await new NDEFReader().write({ records: [{ recordType: 'url', data: urlEtiqueta(l) }] }, { signal: ctrl.signal });
      lectorNfc = null; cerrarModal();
      aviso(`Etiqueta ${delLugar(l)} lista. Pégala en su lugar.`);
    } catch (e) { lectorNfc = null; if (nfcAbierto()) cerrarModal(); errorNfc(e); }
  },
  'nfc-copiar': async el => {
    const l = lugarDe(el.dataset.id); if (!l) return;
    try { await navigator.clipboard.writeText(urlEtiqueta(l)); aviso('Enlace copiado. Grábalo en la etiqueta con una app como NFC Tools.'); }
    catch { abrirModal(dialogoBase({ id: 'dlg-u', icono: 'etiqueta', titulo: `Enlace ${delLugar(l)}`,
      cuerpo: `<p class="mb-2">Grábalo en la etiqueta con una app como NFC Tools.</p><input readonly value="${esc(urlEtiqueta(l))}" class="w-full rounded-xl border border-texto/[0.14] capa px-3 py-2 text-[13px]" onfocus="this.select()">`,
      acciones: '<button type="button" class="btn-primario h-12 text-[15px]" data-accion="cerrar-modal" data-forzar>Listo</button>' }), 'input'); }
  },
  'nfc-rapido': () => {
    const on = !nfcRapido();
    try { localStorage.setItem('roomies:nfc-rapido', on ? '1' : '0'); } catch {}
    refrescar();
    aviso(on ? 'Al tocar una etiqueta, tu única tarea de ese lugar se marca sola' : 'Al tocar una etiqueta, confirmarás antes de marcar');
  },
  'nfc-completar': el => { const t = tarea(el.dataset.id); if (t && t.estado !== 'completada') completarDesdeEtiqueta(t); },
  'nfc-registrar': el => {
    const l = lugarDe(el.dataset.id); if (!l) return;
    abrirModal(dialogoBase({ id: 'dlg-r', icono: l.icono, titulo: `¿Qué hiciste ${enLugar(l)}?`,
      cuerpo: `<form id="form-registrar" class="flex flex-col gap-2 text-left" onsubmit="return false">
          <label class="flex flex-col gap-2"><span class="text-[12px] font-medium sec">Se guarda como tarea hecha por ti</span>
            <span class="campo"><input id="nfc-que" maxlength="60" placeholder="Ej. ${esc(l.ejemplo)}" class="min-w-0 flex-1 bg-transparent text-[15px] leading-[22px] outline-none placeholder:text-texto/70"></span>
          </label>
        </form>`,
      acciones: `${BTN_CANCELAR}<button type="button" class="btn-primario !h-12 flex-1 text-[15px]" data-accion="nfc-registrar-ok" data-id="${l.id}">Registrar</button>` }), '#nfc-que');
    document.getElementById('form-registrar').addEventListener('submit', () => ACC['nfc-registrar-ok']({ dataset: { id: l.id } }));
  },
  'nfc-registrar-ok': el => {
    const l = lugarDe(el.dataset.id), i = document.getElementById('nfc-que'); if (!l || !i) return;
    const titulo = i.value.replace(/[<>&"'`]/g, '').trim();
    if (!titulo) { errorCampo('nfc-que', `Escribe qué hiciste, por ejemplo «${l.ejemplo}».`); return; }
    const t = { id: uid(), titulo, lugar: l.nombre, asignado: S.yo, por: S.yo, vence: new Date(), estado: 'completada', repite: false, alertas: [], avisar: false };
    const av = { id: uid(), cat: 'tareas', tipo: 'nfc', tarea: t.id, persona: S.yo, hora: new Date() };
    S.tareas.push(t); S.avisos.unshift(av);
    cerrarModal(); refrescar();
    aviso(`Registraste “${esc(titulo)}” ${enLugar(l)}`, 'ok', { deshacer: () => { S.tareas = S.tareas.filter(x => x !== t); S.avisos = S.avisos.filter(a => a !== av); } });
  },
});
