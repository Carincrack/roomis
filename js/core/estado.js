/* =========================================================================
   ESTADO de la sesión. Arranca vacío: todo se carga desde Supabase
   (perfil, hogar, miembros, tareas, gastos, avisos y mensajes).
   ========================================================================= */
const hogarVacio = () => ({ id: null, nombre: '', ubicacion: '', codigo: '', integrantes: 4, admin: null,
                            reglas: { aprobar: true, dividir: true, alertas: true } });
const estadoInicial = () => ({
  yo: null,                        // id (uuid) de la persona con sesión iniciada
  miEstado: null,                  // null (sin hogar) · 'pendiente' · 'activo'
  hogar: hogarVacio(),             // sin id = borrador del asistente «Crear hogar»
  hogarBuscado: null,              // resultado de buscar un código (A5/A6)
  inicio: 'crear',                 // A2: crear | unirse
  codigoIngresado: ['', '', '', '', '', ''],
  solicitudEnviada: null,
  personas: {},                    // { id: { nombre, corto, ini, color } }
  roles: {},                       // { id: 'admin' | 'miembro' }
  miembros: [],                    // ids activos
  nuevos: [],                      // aceptados en esta sesión
  solicitudes: [],                 // [{ id, creado }]
  tareas: [], gastos: [], avisos: [], mensajes: [],
  sinLeer: false, chatSinLeer: 0,
  testimonio: 0,
  filtroTareas: 'todas', buscar: '',
  filtroAvisos: 'todos',
  borrador: null, borradorGasto: null,
  recuperando: false,              // entró con el enlace del correo: debe crear una contraseña nueva
  enlaceVencido: false,            // el enlace del correo ya no sirve (se avisa en el login)
});
const S = estadoInicial();
function reiniciarEstado() { const t = S.testimonio; Object.assign(S, estadoInicial(), { testimonio: t }); }

const DESCONOCIDA = { nombre: 'Alguien', corto: 'Alguien', ini: '?', color: '#C6D4DD' };
const persona = id => S.personas[id] || DESCONOCIDA;
const nombreCorto = id => id === S.yo ? 'Tú' : persona(id).corto;
const soyAdmin = () => S.roles[S.yo] === 'admin';
const tieneHogar = () => !!S.hogar.id && S.miEstado === 'activo';
const tarea = id => S.tareas.find(t => t.id === id);
const gasto = id => S.gastos.find(g => g.id === id);
const pendientes = () => S.tareas.filter(t => t.estado !== 'completada');
const activasDe = id => pendientes().filter(t => t.asignado === id).length;
const vencida = t => t.estado !== 'completada' && t.vence < Date.now();
const parte = g => g.entre.length ? g.monto / g.entre.length : 0;
function debo() { return S.gastos.reduce((s, g) => s + (g.pago !== S.yo && g.entre.includes(S.yo) && !g.pagados.includes(S.yo) ? parte(g) : 0), 0); }
function meDeben() { return S.gastos.reduce((s, g) => s + (g.pago === S.yo ? g.entre.filter(p => p !== S.yo && !g.pagados.includes(p)).length * parte(g) : 0), 0); }
