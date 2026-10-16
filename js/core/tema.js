/* Tema claro / oscuro. Se carga en <head> antes de pintar para que no haya parpadeo.
   Preferencia guardada: 'sistema' (sigue al dispositivo) · 'claro' · 'oscuro'. */
const TEMA = {
  pref() { try { return localStorage.getItem('roomies:tema') || 'sistema'; } catch { return 'sistema'; } },
  real(p = TEMA.pref()) { return p === 'sistema' ? (matchMedia('(prefers-color-scheme: light)').matches ? 'claro' : 'oscuro') : p; },
  aplicar() {
    const t = TEMA.real();
    document.documentElement.dataset.tema = t;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = t === 'claro' ? '#E8F2EB' : '#162D32';
  },
  elegir(p) {
    try { localStorage.setItem('roomies:tema', p); } catch {}
    TEMA.aplicar();
  },
};
TEMA.aplicar();
matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => { if (TEMA.pref() === 'sistema') TEMA.aplicar(); });
