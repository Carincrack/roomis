/* =========================================================================
   ESTADO (datos de ejemplo del diseño)
   ========================================================================= */
const ahora = Date.now();
const S = {
  hogar: { nombre: 'Apto 4B', ubicacion: 'Barrio El Carmen, Nicoya', codigo: '4B7K2Q', integrantes: 4,
           reglas: { aprobar: true, dividir: true, alertas: true } },
  inicio: 'crear',                 // A2: crear | unirse
  codigoIngresado: '4B7K2Q'.split(''),
  solicitudEnviada: null,
  yo: 'AA',
  personas: {
    AA: { nombre: 'Andrés Alvarado', corto: 'Andrés', color: '#E4EAE7' },
    BF: { nombre: 'Bairon Fallas',  corto: 'Bairon', color: '#EDEBE4', activas: 4 },
    JG: { nombre: 'Jhonn Granados', corto: 'Jhonn',  color: '#DDE6EE', activas: 2 },
    MS: { nombre: 'María Solís',    corto: 'María',  color: '#EFE8D2' },
    KM: { nombre: 'Kevin Mora',     corto: 'Kevin',  color: '#E7E2EE' },
  },
  miembros: ['AA', 'BF', 'JG'],
  nuevos: [],
  solicitudes: [ { id: 'MS', hace: 'hace 5 min' }, { id: 'KM', hace: 'hace 1 h' } ],
  tareas: [
    { id: 't1', titulo: 'Lavar los platos',   lugar: 'Cocina', asignado: 'AA', por: 'BF', vence: new Date(ahora + 2*H + 14*6e4 + 35e3), estado: 'progreso',  repite: true,  alertas: ['1d','3h'], avisar: true },
    { id: 't2', titulo: 'Sacar la basura',    lugar: 'Casa',   asignado: 'JG', por: 'AA', vence: new Date(ahora - 3*H), estado: 'pendiente', repite: true,  alertas: ['3h'], avisar: true },
    { id: 't3', titulo: 'Limpiar el baño',    lugar: 'Baño',   asignado: 'BF', por: 'AA', vence: proximoSabado(), estado: 'pendiente', repite: true, alertas: ['1d'], avisar: true },
    { id: 't4', titulo: 'Comprar detergente', lugar: 'Compras',asignado: 'AA', por: 'JG', vence: new Date(ahora - 1*D), estado: 'completada', alertas: [], avisar: false },
    { id: 't5', titulo: 'Pagar internet',     lugar: 'Casa',   asignado: 'BF', por: 'AA', vence: new Date(ahora - 2*D), estado: 'completada', alertas: [], avisar: false },
    { id: 't6', titulo: 'Barrer la sala',     lugar: 'Sala',   asignado: 'AA', por: 'AA', vence: new Date(ahora - 2*D), estado: 'completada', alertas: [], avisar: false },
    { id: 't7', titulo: 'Limpiar la refri',   lugar: 'Cocina', asignado: 'JG', por: 'BF', vence: new Date(ahora - 3*D), estado: 'completada', alertas: [], avisar: false },
    { id: 't8', titulo: 'Regar las plantas',  lugar: 'Patio',  asignado: 'BF', por: 'BF', vence: new Date(ahora - 4*D), estado: 'completada', alertas: [], avisar: false },
  ],
  gastos: [
    { id: 'g1', titulo: 'Internet',   cat: 'wifi',    monto: 12600, pago: 'BF', entre: ['AA','BF','JG'], pagados: ['BF','JG'], fecha: new Date(ahora - 1*D) },
    { id: 'g2', titulo: 'Detergente', cat: 'carrito', monto: 3200,  pago: 'JG', entre: [],               pagados: ['JG'],      fecha: new Date(ahora - 2*D) },
    { id: 'g3', titulo: 'Agua',       cat: 'gota',    monto: 6100,  pago: 'AA', entre: ['AA','BF','JG'], pagados: ['AA','BF'], fecha: new Date(ahora - 4*D) },
    { id: 'g4', titulo: 'Luz',        cat: 'rayo',    monto: 18900, pago: 'AA', entre: ['AA','BF','JG'], pagados: ['AA','BF','JG'], fecha: new Date(ahora - 8*D) },
  ],
  avisos: [
    { id: 'n1', cat: 'tareas', tipo: 'por-vencer', tarea: 't1', hora: new Date(ahora - 45*6e4) },
    { id: 'n2', cat: 'tareas', tipo: 'vencida',    tarea: 't2', hora: new Date(ahora - 3*H) },
    { id: 'n3', cat: 'hogar',  tipo: 'solicitud',  persona: 'KM', hora: new Date(ahora - 4*H) },
    { id: 'n4', cat: 'gastos', tipo: 'gasto',      gasto: 'g1', hora: new Date(ahora - 1*D) },
  ],
  sinLeer: true,
  testimonio: 0,
  filtroTareas: 'todas', buscar: '',
  filtroAvisos: 'todos',
  borrador: null, borradorGasto: null,
};

const persona = id => S.personas[id];
const nombreCorto = id => id === S.yo ? 'Tú' : persona(id).corto;
const tarea = id => S.tareas.find(t => t.id === id);
const gasto = id => S.gastos.find(g => g.id === id);
const pendientes = () => S.tareas.filter(t => t.estado !== 'completada');
const vencida = t => t.estado !== 'completada' && t.vence < Date.now();
const parte = g => g.entre.length ? g.monto / g.entre.length : 0;
function debo() { return S.gastos.reduce((s, g) => s + (g.pago !== S.yo && g.entre.includes(S.yo) && !g.pagados.includes(S.yo) ? parte(g) : 0), 0); }
function meDeben() { return S.gastos.reduce((s, g) => s + (g.pago === S.yo ? g.entre.filter(p => p !== S.yo && !g.pagados.includes(p)).length * parte(g) : 0), 0); }

