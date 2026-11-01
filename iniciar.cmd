@echo off
rem Configura Roomies con los datos de .env y abre la app en el navegador.
cd /d "%~dp0"
where node >nul 2>nul && node scripts\configurar.js || echo Node.js no esta instalado: se usa la configuracion que ya trae js\config\supabase-config.js
start "" "%~dp0index.html"
