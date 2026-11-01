/* Lee .env y genera js/config/supabase-config.js (la app es HTML sin compilar y el navegador no puede leer .env).
   Uso: node scripts/configurar.js */
const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..');
const archivoEnv = path.join(raiz, '.env');
if (!fs.existsSync(archivoEnv)) {
  console.error('No existe .env. Copia .env.example como .env y llena tus datos.');
  process.exit(1);
}
const env = {};
for (const linea of fs.readFileSync(archivoEnv, 'utf8').split(/\r?\n/)) {
  const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m && !linea.trim().startsWith('#')) env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
}
const url = env.SUPABASE_URL || '', clave = env.SUPABASE_PUBLISHABLE_KEY || '';
if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url)) { console.error('SUPABASE_URL no es válida: ' + url); process.exit(1); }
if (/^sb_secret_/.test(clave) || /service_role/.test(Buffer.from(clave.split('.')[1] || '', 'base64').toString())) {
  console.error('Esa es una clave SECRETA. En el navegador solo va la clave publicable (sb_publishable_…).');
  process.exit(1);
}
if (!clave) console.warn('Aviso: SUPABASE_PUBLISHABLE_KEY está vacía; el login avisará que falta configurar Supabase.');

const salida = path.join(raiz, 'js', 'config', 'supabase-config.js');
fs.writeFileSync(salida, `// Generado por scripts/configurar.js a partir de .env. No lo edites a mano: cambia .env y vuelve a correr el script.
// Usa la clave PUBLICABLE (sb_publishable_… o la «anon» heredada). Nunca la service_role/secret.
// Si la clave queda vacía, el login avisa que falta configurar Supabase.
const SUPABASE_CONFIG = {
  url: ${JSON.stringify(url.replace(/\/$/, ''))},
  clave: ${JSON.stringify(clave)},
};
`);
console.log('Listo: js/config/supabase-config.js actualizado con los datos de .env');
