/* Acciones: onboarding */
Object.assign(ACC, {
  'elegir-inicio': el => { S.inicio = el.dataset.id; refrescar(); },
  'integrantes:1': () => { S.hogar.integrantes++; refrescar(); },
  'integrantes:-1': () => { S.hogar.integrantes--; refrescar(); },
  'crear-hogar': () => {
    const n = document.getElementById('nombre-hogar').value.trim();
    if (!n) { errorCampo('nombre-hogar', 'Ponle un nombre a tu hogar, por ejemplo «Apto 4B».'); return; }
    S.hogar.nombre = n; ir('#/codigo');
  },
  'copiar-codigo': async () => {
    try { await navigator.clipboard.writeText(S.hogar.codigo); aviso('Código copiado'); }
    catch { aviso(`Tu código es ${S.hogar.codigo}`); }
  },
  'compartir-codigo': async () => {
    const texto = `¡Únete a ${S.hogar.nombre} en Roomies! Código de invitación: ${S.hogar.codigo}`;
    if (navigator.share) { try { await navigator.share({ title: 'Roomies', text: texto }); } catch {} }
    else { try { await navigator.clipboard.writeText(texto); aviso('Invitación copiada para compartir'); } catch { aviso(texto); } }
  },
  'enviar-solicitud': () => { S.solicitudEnviada = new Date(); ir('#/esperando'); },
  'cancelar-solicitud': () => confirmar({
    titulo: '¿Cancelar tu solicitud?', texto: `Dejarás de esperar la aprobación de ${esc(S.hogar.nombre)}. Podrás volver a enviarla con el mismo código.`,
    etiqueta: 'Cancelar solicitud', icono: 'x',
    alAceptar: () => { const antes = S.solicitudEnviada; S.solicitudEnviada = null; ir('#/crear-o-unirse'); aviso('Solicitud cancelada', 'alerta', { deshacer: () => { S.solicitudEnviada = antes; ir('#/esperando'); } }); },
  }),
  'regla:aprobar': () => { S.hogar.reglas.aprobar = !S.hogar.reglas.aprobar; refrescar(); },
  'regla:dividir': () => { S.hogar.reglas.dividir = !S.hogar.reglas.dividir; refrescar(); },
  'regla:alertas': () => { S.hogar.reglas.alertas = !S.hogar.reglas.alertas; refrescar(); },
});
