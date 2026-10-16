# Auditoría de usabilidad · Roomies

Evaluación de las 17 vistas contra las 10 heurísticas de Nielsen, más accesibilidad básica.
Paleta: clara y cálida (crema, verde salvia, miel y coral). Contraste de texto verificado ≥ 4,5:1.

| # | Heurística | Hallazgo | Cambio realizado |
|---|---|---|---|
| 1 | Visibilidad del estado | Los avisos desaparecían en 2,6 s y no decían qué había pasado en las acciones reversibles | Avisos de 3,2 s; con «Deshacer» duran 6,5 s. Los avisos escapan el texto del usuario |
| 2 | Coincidencia con el mundo real | La pestaña «Perfil» abría «Miembros» y la barra lateral la llamaba distinto | Nueva pantalla **Perfil** (cuenta, hogar, reglas, ayuda, cerrar sesión). «Miembros» cuelga de Perfil |
| 3 | Control y libertad | Completar, pagar, aceptar o rechazar no se podían revertir. Editar y eliminar tareas decían «pronto» | **Deshacer** en 12 acciones. **Editar y eliminar** tareas. **Quitar miembros** con confirmación |
| 4 | Consistencia | El icono de ajustes de Tareas llevaba al asistente «Crear hogar» | Reemplazado por ayuda contextual. Reglas del hogar viven en Perfil |
| 5 | Prevención de errores | Cancelar solicitud, cerrar sesión y eliminar no pedían confirmación. Se podía crear una tarea con fecha pasada | Diálogo de confirmación reutilizable. Validación de fecha futura. Título de tarea vacío por defecto en vez de texto precargado |
| 6 | Reconocer antes que recordar | Etiquetas e iconos con texto ya presentes | Sin cambios; se añadieron ejemplos en los mensajes de error |
| 7 | Flexibilidad y eficiencia | Pegar código completo, buscador y filtros ya existían | Sin cambios |
| 8 | Diseño minimalista | Sin hallazgos graves | Sin cambios |
| 9 | Ayudar a reconocer y recuperarse de errores | Los errores salían solo como aviso flotante, lejos del campo | Errores **en línea** junto al campo (`aria-invalid`, `role="alert"`), con qué corregir. Estado vacío en Gastos. Aviso si una tarea ya no existe |
| 10 | Ayuda y documentación | No había ayuda | Botón **?** contextual en Tareas, Nueva tarea, Gastos, Agregar gasto, Unirse, Crear hogar y Perfil |

## Accesibilidad
- Objetivos táctiles de 44 px en botones de icono y de 40–44 px en chips y botones secundarios.
- Los diálogos devuelven el foco al cerrar, atrapan Tab y se cierran con Escape.
- El anillo de foco no se duplica dentro de los campos.

## Errores de código corregidos en el camino
- «Rotar» tarea reordenaba `S.miembros` (usaba `sort` sobre el original). Ahora ordena una copia.
- Los títulos escritos por el usuario se insertaban sin escapar en los avisos.

## Pendiente
- Los datos viven en memoria y se pierden al recargar (falta persistencia).
- No hay editar ni eliminar gastos.
- No hay pantalla de inicio de sesión (el enlace de la bienvenida lleva al inicio).
- Tailwind se carga por CDN; para producción conviene compilarlo.
