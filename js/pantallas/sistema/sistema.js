/* ---------- Sistema de diseño · Roomies (hoja de componentes) ---------- */
P.sistema = () => {
  const fila1 = ['casa','billetera','tareas','campana','usuario','usuarios','usuario-mas','mas','flecha-der','atras','chevron','reloj','alarma','calendario','hash','copiar','compartir','check','x','entrar'];
  const fila2 = ['escudo','ajustes','bandera','repetir','corona','buscar','roomies','alerta','mas-opciones'];
  const icono = n => `<span class="grid size-10 place-items-center rounded-xl capa-tenue" title="${n}">${ic(n, 'size-[22px]')}</span>`;
  const barra = act => `
    <div class="flex h-[72px] items-center justify-between rounded-[28px] border border-texto/[0.14] barra-liquida px-2.5 shadow-vidrio backdrop-blur-[16px]">
      ${TABS.map(([id, txt, ico]) => {
        const on = id === act;
        return `<span class="flex w-[62px] flex-col items-center gap-1"><span class="relative grid h-8 w-[46px] place-items-center rounded-2xl ${on ? 'lente' : ''}">${ic(ico, 'size-[21px]')}${id === 'avisos' ? '<span class="absolute left-[27px] top-1 size-2 rounded-full border border-fondo-top bg-alerta"></span>' : ''}</span><span class="text-[11px] font-medium leading-4 ${on ? '' : 'tenue'}">${txt}</span></span>`;
      }).join('')}
    </div>`;
  const seccion = (t, c) => `<section class="flex flex-col gap-3"><p class="micro tenue">${t}</p>${c}</section>`;
  return {
    ancho: 'max-w-[960px]',
    html: `
      ${encabezado({ titulo: 'Sistema de diseño · Roomies', izq: atras('#/login') })}
      <div class="flex flex-col gap-8 pt-2">
        ${seccion('Iconos', `<div class="vidrio flex flex-col gap-3 rounded-[28px] p-5"><div class="flex flex-wrap gap-2">${fila1.map(icono).join('')}</div><div class="flex flex-wrap gap-2">${fila2.map(icono).join('')}</div></div>`)}
        ${seccion('Barra de estado y progreso', `<div class="vidrio flex items-center justify-between gap-6 rounded-[28px] p-5"><span class="text-[15px] font-semibold">9:41</span><span class="h-1 w-32 rounded capa-fuerte"></span></div>`)}
        ${seccion('Botones y avatar', `<div class="vidrio flex flex-col items-center gap-4 rounded-[28px] p-5 md:flex-row"><button type="button" class="btn-primario">Continuar ${ic('flecha-der', 'size-5')}</button><button type="button" class="btn-vidrio">Continuar</button>${avatar('AA', 38, 13)}</div>`)}
        ${seccion('Barra de navegación · 5 estados', `<div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">${TABS.map(([id]) => `<div class="min-w-0 overflow-x-auto">${barra(id)}</div>`).join('')}</div>`)}
      </div>`,
  };
};
