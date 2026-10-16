// Tokens del sistema de diseño Roomies · paleta minimalista (neutros + un solo acento verde)
tailwind.config = {
  theme: {
    extend: {
      colors: {
        texto:  '#171717',                       // Texto/Primario (tinta neutra)
        sobre:  '#FFFFFF',                       // Texto/Sobre acento
        acento: { teal: '#0B7A5A', tea: '#0B7A5A', claro: '#0B7A5A', tropical: '#2F6F5E' },
        alerta: '#9A5B00',                       // Estado/Alerta
        peligro:'#B3261E',                       // Estado/Peligro
        fondo:  { top: '#E6F4EC', mid: '#F2F9F5', bottom: '#FFFFFF' },
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans:  ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        vidrio: '0 10px 30px 0 rgba(0,0,0,0.05)',     // Roomies/Vidrio
        brillo: '0 6px 16px 0 rgba(11,122,90,0.18)', // Roomies/Brillo acento
      },
      screens: { xs: '380px' },
    },
  },
};
