/* Acciones: onboarding (crear hogar, unirse con código y esperar aprobación) */

/* Desactiva el botón mientras corre una operación en la nube */
async function conCarga(el, texto, fn) {
  const previo = el && el.innerHTML;
  if (el) { el.disabled = true; el.innerHTML = `<span class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true"></span>${texto}`; }
  try { return await fn(); }
  finally { if (el && document.contains(el)) { el.disabled = false; el.innerHTML = previo; } }
}

Object.assign(ACC, {
  'elegir-inicio': el => { S.inicio = el.dataset.id; refrescar(); },
  'integrantes:1': () => { S.hogar.integrantes++; refrescar(); },
  'integrantes:-1': () => { S.hogar.integrantes--; refrescar(); },
  'crear-hogar': el => {
    const n = document.getElementById('nombre-hogar').value.trim();
    if (!n) { errorCampo('nombre-hogar', 'Ponle un nombre a tu hogar, por ejemplo «Apto 4B».'); return; }
    S.hogar.nombre = n;
    conCarga(el, 'Creando hogar…', async () => {
      try { await AUTH.crearHogar(n, S.hogar.integrantes, S.hogar.reglas); location.hash = '#/codigo'; aviso(`${esc(S.hogar.nombre)} está listo`); }
      catch (e) { aviso(mensajeError(e), 'peligro'); }
    });
  },
  'copiar-codigo': async () => {
    try { await navigator.clipboard.writeText(S.hogar.codigo); aviso('Código copiado'); }
    catch { aviso(`Tu código es ${esc(S.hogar.codigo)}`); }
  },
  'compartir-codigo': async () => {
    const texto = `¡Únete a ${S.hogar.nombre} en Roomies! Código de invitación: ${S.hogar.codigo}`;
    if (navigator.share) { try { await navigator.share({ title: 'Roomies', text: texto }); } catch {} }
    else { try { await navigator.clipboard.writeText(texto); aviso('Invitación copiada para compartir'); } catch { aviso(esc(texto)); } }
  },
  'enviar-solicitud': el => conCarga(el, 'Enviando…', async () => {
    try {
      const estado = await AUTH.unirse(S.codigoIngresado.join(''));
      if (estado === 'activo') { location.hash = '#/inicio'; aviso(`¡Bienvenido a ${esc(S.hogar.nombre)}!`); }
      else location.hash = '#/esperando';
    } catch (e) { aviso(mensajeError(e), 'peligro'); }
  }),
  'cancelar-solicitud': () => confirmar({
    titulo: '¿Cancelar tu solicitud?', texto: `Dejarás de esperar la aprobación de ${esc(S.hogarBuscado ? S.hogarBuscado.nombre : 'ese hogar')}. Podrás volver a enviarla con el mismo código.`,
    etiqueta: 'Cancelar solicitud', icono: 'x',
    alAceptar: async () => {
      try { await AUTH.cancelarSolicitud(); location.hash = '#/crear-o-unirse'; aviso('Solicitud cancelada', 'alerta'); }
      catch (e) { aviso(mensajeError(e), 'peligro'); }
    },
  }),
  'regla:aprobar': () => { S.hogar.reglas.aprobar = !S.hogar.reglas.aprobar; refrescar(); },
  'regla:dividir': () => { S.hogar.reglas.dividir = !S.hogar.reglas.dividir; refrescar(); },
  'regla:alertas': () => { S.hogar.reglas.alertas = !S.hogar.reglas.alertas; refrescar(); },
});
