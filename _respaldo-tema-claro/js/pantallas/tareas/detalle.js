/* ---------- C4 · Detalle de tarea (tiempo límite) ---------- */
P.tarea = (q, id) => {
  const t = tarea(id);
  if (!t) { setTimeout(() => aviso('Esa tarea ya no existe', 'alerta')); return P.tareas(q); }
  const est = (k, txt) => `<button type="button" role="radio" aria-checked="${t.estado === k}" data-accion="estado-tarea" data-id="${k}" class="flex flex-1 justify-center rounded-2xl py-2.5 text-[12px] font-medium leading-4 transition ${t.estado === k ? 'bg-gradient-to-r from-acento-claro to-acento-teal text-sobre' : 'sec hover:bg-white/[0.6]'}">${txt}</button>`;
  const alertas = [];
  if (t.alertas.includes('1d')) alertas.push(['1 día antes', new Date(t.vence - D), false]);
  if (t.alertas.includes('3h')) alertas.push(['3 horas antes', new Date(t.vence - 3 * H), false]);
  if (t.alertas.includes('30m')) alertas.push(['30 minutos antes', new Date(t.vence - 30 * 6e4), false]);
  if (t.avisar) alertas.push(['Al vencer (aviso al hogar)', t.vence, true]);
  const filaAlerta = ([txt, d, hogar], i) => {
    const enviada = d < Date.now();
    return `${i ? '<div class="divisor"></div>' : ''}
      <div class="flex items-center gap-3">
        <span class="grid size-[26px] shrink-0 place-items-center rounded-full ${hogar && !enviada ? 'bg-alerta/[0.16] text-alerta' : 'bg-acento-teal/[0.18] text-acento-tea'}">${ic(hogar && !enviada ? 'campana' : enviada ? 'check' : 'reloj', 'size-3.5', 2)}</span>
        <div class="flex min-w-0 flex-1 flex-col"><p class="text-[15px] font-medium leading-[22px]">${txt}</p><p class="text-[13px] leading-[18px] tenue">${cap(diaPalabra(d))} · ${hora(d)}</p></div>
        <span class="text-[12px] font-medium leading-4 ${enviada ? 'text-acento-teal' : 'text-alerta'}">${enviada ? 'Enviada' : 'Programada'}</span>
      </div>`;
  };
  const hecha = t.estado === 'completada';
  return {
    ancho: ANCHO.form,
    html: `
      ${encabezado({ titulo: 'Detalle de tarea', izq: atras('#/tareas'), der: { icono: 'mas-opciones', etiqueta: 'Más opciones', accion: 'opciones-tarea' } })}
      <div class="flex flex-col gap-2.5 md:grid md:grid-cols-2 md:items-start md:gap-x-8 lg:gap-x-12">
        <div class="flex flex-col gap-2.5">
        <section class="vidrio-fuerte flex flex-col gap-3 rounded-[26px] px-[18px] py-3.5">
          <div class="flex items-center gap-3.5">
            <span class="burbuja size-[50px]">${ic('tareas', 'size-[23px]')}</span>
            <div class="flex min-w-0 flex-1 flex-col gap-0.5">
              <h2 class="h2 ${hecha ? 'line-through decoration-texto/40' : ''}">${esc(t.titulo)}</h2>
              <p class="text-[13px] leading-[18px] tenue">${esc(t.lugar)}${t.repite ? ' · se repite cada semana' : ''}</p>
            </div>
          </div>
          <div class="divisor"></div>
          <div class="flex items-center gap-2.5">
            ${avatar(t.asignado, 30, 11)}
            <p class="min-w-0 flex-1 text-[15px] font-medium leading-[22px]">${t.asignado === S.yo ? 'Asignada a ti' : `Asignada a ${persona(t.asignado).corto}`}${t.por !== t.asignado ? ` por ${nombreCorto(t.por) === 'Tú' ? 'ti' : persona(t.por).corto}` : ''}</p>
            ${t.por !== t.asignado ? avatar(t.por, 26, 9) : ''}
          </div>
        </section>

        <section id="cuenta" class="flex flex-col items-center gap-2.5 rounded-[26px] border px-[18px] py-3.5 shadow-vidrio backdrop-blur-[12px]"></section>

        <div class="flex gap-1 rounded-[20px] border border-texto/[0.12] bg-white/[0.6] p-1" role="radiogroup" aria-label="Estado de la tarea">
          ${est('pendiente', 'Pendiente')}${est('progreso', 'En progreso')}${est('completada', 'Completada')}
        </div>
        </div>
        <div class="flex flex-col gap-2.5">
        ${alertas.length ? `
        <p class="micro tenue pt-1 md:pt-0">Alertas programadas</p>
        <div class="flex flex-col gap-2 rounded-[20px] border border-texto/[0.14] bg-white/[0.6] px-4 py-3">${alertas.map(filaAlerta).join('')}</div>` : ''}
        </div>
      </div>`,
    cta: hecha
      ? `<button type="button" data-accion="estado-tarea" data-id="pendiente" class="btn-vidrio">Reabrir tarea</button>`
      : `<button type="button" data-accion="completar-tarea" data-id="${t.id}" class="btn-primario">Marcar como completada</button>`,
    montar() {
      const caja = document.getElementById('cuenta');
      const pintar = () => {
        if (t.estado === 'completada') {
          caja.className = 'flex flex-col items-center gap-2 rounded-[26px] border border-acento-teal/40 bg-acento-teal/[0.08] px-[18px] py-5 shadow-vidrio backdrop-blur-[12px]';
          caja.innerHTML = `<span class="grid size-11 place-items-center rounded-full bg-acento-tea text-sobre">${ic('check', 'size-5', 2.2)}</span><p class="text-[15px] font-medium">Tarea completada</p><p class="text-[13px] tenue">Tu hogar ya lo puede ver.</p>`;
          return;
        }
        const diff = t.vence - Date.now(), venc = diff < 0, a = Math.abs(diff);
        const h = Math.floor(a / H), m = Math.floor(a % H / 6e4), s = Math.floor(a % 6e4 / 1e3);
        const col = venc ? 'peligro' : 'alerta';
        caja.className = `flex flex-col items-center gap-2.5 rounded-[26px] border px-[18px] py-3.5 shadow-vidrio backdrop-blur-[12px] ${venc ? 'border-peligro/50 bg-peligro/[0.07]' : 'border-alerta/50 bg-alerta/[0.07]'}`;
        const u = (v, l) => `<div class="flex flex-1 flex-col items-center rounded-2xl border ${venc ? 'border-peligro/25' : 'border-alerta/25'} bg-white/[0.7] pb-2 pt-2.5"><span class="font-serif text-[34px] font-medium leading-10 tracking-[-0.17px] tabular-nums text-${col}">${String(v).padStart(2, '0')}</span><span class="text-[12px] font-medium leading-4 tenue">${l}</span></div>`;
        caja.innerHTML = `
          <p class="micro text-${col}">${venc ? 'Vencida hace' : 'Tiempo restante'}</p>
          <div class="flex w-full gap-2.5" aria-live="off">${h > 99 ? u(Math.floor(h / 24), 'días') + u(h % 24, 'horas') + u(m, 'min') : u(h, 'horas') + u(m, 'min') + u(s, 'seg')}</div>
          <p class="flex items-center gap-1.5 text-[13px] leading-[18px] sec">${ic('calendario', 'size-[15px]')}${venc ? 'Venció' : 'Vence'} ${diaPalabra(t.vence)}, ${DIAS[t.vence.getDay()]} ${t.vence.getDate()} · ${hora(t.vence)}</p>`;
      };
      pintar();
      const iv = setInterval(pintar, 1000);
      return () => clearInterval(iv);
    },
  };
};
