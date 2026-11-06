# Roomies

SPA sin build: abre `index.html` (scripts clásicos, funciona con `file://`). Tailwind por CDN.

## Estructura

```
index.html                 Shell: contenedores + orden de carga de scripts
css/estilos.css            CSS plano (foco, animaciones, inputs de fecha)
js/
  config/                  tailwind-config.js — tokens del sistema de diseño
  core/                    iconos · utilidades · estado (datos de ejemplo) · router · acciones · main
  componentes/             avatar · interruptor · encabezado · chip-vence · fila-tarea · navegacion · aviso · modal · dialogo-rechazo · panel-imagen (login y registro)
  pantallas/
    login/                 Iniciar sesión (pantalla de inicio de la app)
    registro/              Crear cuenta (mismo diseño dividido que el login)
    onboarding/            A1 bienvenida · A2 crear-o-unirse · A3 configurar-hogar · A4 codigo · A5 unirse · A6 esperando
    miembros/              B1 miembros (B2 diálogo, B3 aviso)
    inicio/                C1 inicio
    tareas/                C2 lista · C3 nueva · C4 detalle
    avisos/                C5 avisos
    gastos/                D1 lista · D2 detalle · D3 nuevo
    sistema/               Hoja del sistema de diseño (#/sistema)
  acciones/                Handlers de data-accion por dominio (registrados en ACC)
```

## Convenciones
- Cada pantalla se registra con `P['ruta'] = (q, id) => ({ html, tab?, cta?, fab?, ancho?, completa?, montar? })`.
- Las acciones se declaran en HTML con `data-accion="nombre"` y se registran con `Object.assign(ACC, {...})`.
- Orden de carga: core → componentes → pantallas → acciones → `core/main.js` (último).
- Para una vista nueva: crear `js/pantallas/<flujo>/<vista>.js`, añadir el `<script>` en `index.html` antes de las acciones y, si lleva navegación, añadir su nombre al `Set APP` de `core/router.js`.

## Diseño (Fase 3 · Figma)
- Tema oscuro **vidrio líquido sobre verde profundo**, según `Fase 3 - Versión full funcional` en Figma. Los tokens están en `js/config/tailwind-config.js` y las superficies (`.vidrio`, `.capa`, `.barra-liquida`, `.lente`, `.modal-vidrio`, botones) en el bloque `text/tailwindcss` de `index.html`.
- La barra inferior tiene una lente de vidrio que se desliza entre pestañas (`js/componentes/navegacion.js`).
- El tema claro anterior está respaldado en `_respaldo-tema-claro/`.

## Supabase y tiempo real
- **Sin datos quemados:** todo empieza vacío y se guarda en Supabase.
- Esquema: `supabase/migrations/20261016120000_roomies.sql` → perfiles, hogares, miembros, tareas, gastos, avisos y mensajes, con RLS por hogar (cada quien ve solo su hogar), RPC `crear_hogar`, `buscar_hogar` y `solicitar_unirse`, y publicación Realtime.
- Clave publicable en `js/config/supabase-config.js`.
- Flujo: Registro o Login (Supabase Auth) → Crear hogar (genera código de 6 caracteres) **o** Unirse con código → el admin acepta en Miembros → entra en vivo.
- **Cuenta de prueba:** `bairon@roomies.cr` / `roomies2026` (la crea la migración, sin hogar). Botón «Usar la cuenta de prueba» en el login.
- `js/core/nube.js`: sesión, carga del hogar, sincronización por diferencias y Realtime (también presencia y «está escribiendo» del chat).
- Si el proyecto exige confirmar el correo, los registros nuevos deben confirmarlo antes de entrar (o desactiva *Confirm email* en Authentication → Sign In / Providers para pruebas).

## Etiquetas NFC (computación ubicua)

Cada lugar de la casa (cocina, baño, sala, lavandería, basurero, patio) puede llevar una etiqueta NFC que guarda solo un enlace: `https://<donde-esté-publicado>/#/nfc/cocina?nfc=1`.

- Al acercar el teléfono, Android o iPhone abren ese enlace y Roomies muestra las tareas de ese lugar: primero las tuyas, luego las de otros y lo último que se hizo ahí.
- **Marcar como hecha** crea un aviso para el hogar («Bairon marcó “Lavar los platos” en la cocina»), que llega en tiempo real. Siempre hay **Deshacer**.
- **Marcar al tocar** (en Perfil → Etiquetas NFC) marca de una vez tu única tarea de ese lugar. Sirve para comparar las dos variantes en el plan de evaluación.
- Sin etiquetas a mano, **Simular toque** recrea el gesto. En Chrome para Android (con HTTPS) aparecen **Leer una etiqueta** y **Grabar** (Web NFC). En los demás navegadores, el botón copia el enlace para grabarlo con una app como NFC Tools.
- No hace falta cambiar la base: se usa la columna `lugar` que ya tenía `tareas`. Al crear una tarea se elige el lugar.
- Para usar etiquetas reales, Roomies tiene que estar publicado en internet (por ejemplo, en GitHub Pages). El enlace de una copia local solo funciona en esa computadora.

## Usar Roomies en otra computadora

1. Copia la carpeta del proyecto, incluido el archivo `.env`. Si no lo tienes, copia `.env.example` como `.env` y llena `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY`.
2. Haz doble clic en `iniciar.cmd`. Genera `js/config/supabase-config.js` a partir de `.env` y abre la app en el navegador. También puedes correr `node scripts/configurar.js` y abrir `index.html`.
3. Si cambias la clave en Supabase, cambia solo `.env` y vuelve a correr el script.

`SITE_URL` (opcional, por defecto `https://roomis.vercel.app`) es la dirección a la que vuelve el enlace de «¿Olvidaste tu contraseña?». En Supabase, esa misma dirección debe estar en **Authentication → URL Configuration → Site URL**.

`.env` lleva solo la clave **publicable**. El script no acepta una clave secreta. `.env` está en `.gitignore`, así que no se sube a GitHub: pásalo por otro medio.
