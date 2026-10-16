// Tokens del sistema de diseño Roomies · los valores viven en variables CSS por tema (index.html)
// para que el mismo diseño funcione en modo claro y oscuro. <alpha-value> mantiene los /opacidad.
const v = n => `rgb(var(--c-${n}) / <alpha-value>)`;
tailwind.config = {
  future: { hoverOnlyWhenSupported: true },   // hover solo con puntero fino: evita estados pegados al tocar
  theme: {
    extend: {
      colors: {
        texto:  v('texto'),                      // Roomies/Texto/Primario
        sobre:  v('sobre'),                      // Texto sobre el acento
        velo:   v('velo'),                       // tinte de velos y bordes (blanco en oscuro, tinta en claro)
        acento: { tea: v('tea'), claro: v('claro'), teal: v('teal'), tropical: v('tropical'), fondo: v('acento-fondo') },
        alerta:  { DEFAULT: v('alerta'), fondo: v('alerta-fondo') },
        peligro: { DEFAULT: v('peligro'), fondo: v('peligro-fondo') },
        fondo:  { top: v('fondo-top'), mid: v('fondo-mid'), bottom: v('fondo-bottom') },
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans:  ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        vidrio: '0 10px 30px 0 rgba(0,0,0,0.18)',
        brillo: '0 8px 24px 0 rgb(var(--c-teal) / 0.32)',
      },
      screens: { xs: '380px' },
    },
  },
};
