// CRUZ — trust-loop & copilot data (mock, honestly illustrative — "DATOS DEMO").
// Encodes the product invariant: CRUZ prepares; the human signs. Nothing files,
// pays, or emails without explicit GO. Strings here are domain data, not UI copy.

const { EMBARQUES } = require('./embarques');

const byId = (id) => EMBARQUES.find((e) => e.id === id);

// Decision queue — "¿Qué necesita de ti ahora?" Ranked by value × urgency.
// kind: firma (ready to sign) · vencimiento (deadline radar) · bloqueado (waiting on docs)
const DECISIONS = [
  {
    id: 'D-1', kind: 'firma', embarque: 'EVCO-2026-0418',
    titulo: 'Pedimento listo para tu firma',
    detalle: 'CRUZ clasificó, validó y costeó el pedimento completo. La firma legal es tuya.',
    accion: 'Aprobar y firmar', confianza: 97,
  },
  {
    id: 'D-2', kind: 'firma', embarque: 'EVCO-2026-0410',
    titulo: 'Pedimento listo para tu firma',
    detalle: '14/14 validaciones SAT aprobadas. Patente 3801 en juego.',
    accion: 'Aprobar y firmar', confianza: 95,
  },
  {
    id: 'D-3', kind: 'vencimiento', embarque: 'EVCO-2026-0417',
    titulo: 'Revisión documental antes de las 14:40',
    detalle: 'Laredo llega a 67 min de espera. Verifica factura y resuelve para la ventana verde.',
    accion: 'Revisar ahora', confianza: 82,
  },
  {
    id: 'D-4', kind: 'bloqueado', embarque: 'EVCO-2026-0413',
    titulo: 'Carga detenida — acción del agente aduanal',
    detalle: 'Semáforo rojo en Nuevo Laredo. CRUZ pre-redactó la respuesta al requerimiento.',
    accion: 'Abrir expediente', confianza: 74,
  },
].map((d) => {
  const e = byId(d.embarque);
  return { ...d, cliente: e?.cliente, pedimento: e?.pedimento, semaforo: e?.semaforo, valorUsd: e?.valorUsd };
});

// Honest data sources — LIVE means a real feed; STAGED means honest-empty until creds connect.
const SOURCES = [
  { id: 'sat', nombre: 'SAT · Pedimentos / Anexo 24', estado: 'live' },
  { id: 'econta', nombre: 'e.conta · Pólizas', estado: 'live' },
  { id: 'cbp', nombre: 'CBP · Tiempos de cruce', estado: 'live' },
  { id: 'qb', nombre: 'QuickBooks · Facturación', estado: 'staged' },
  { id: 'carrier', nombre: 'Transportistas · GPS', estado: 'staged' },
];

// Agent crew — the six specialists; the active one tracks the current step.
const CREW = [
  { id: 'clas', nombre: 'Clasificador' },
  { id: 'valor', nombre: 'Valoración' },
  { id: 'cumpl', nombre: 'Cumplimiento' },
  { id: 'traf', nombre: 'Tráfico' },
  { id: 'tes', nombre: 'Tesorería' },
  { id: 'com', nombre: 'Comunicación' },
];

// Per-surface copilot context: what CRUZ "sees" here + ≤3 proposed actions.
const COPILOT = {
  inicio: {
    ve: 'Resumen de tu operación — 4 decisiones esperan tu firma, 1 está fuera de banda de tiempo.',
    propuestas: [
      { id: 'p1', label: 'Preparar los 2 pedimentos listos', go: true },
      { id: 'p2', label: 'Programar cruces a la ventana verde' },
      { id: 'p3', label: 'Redactar respuesta al requerimiento SAT' },
    ],
  },
  embarques: {
    ve: '14 embarques en seguimiento · 7 en ruta · 2 requieren atención.',
    propuestas: [
      { id: 'p1', label: 'Clasificar partidas de los 3 nuevos', go: true },
      { id: 'p2', label: 'Validar origen y T-MEC' },
    ],
  },
  pedimentos: {
    ve: 'Línea de despacho de hoy — 2 pedimentos preparados, esperando tu firma.',
    propuestas: [
      { id: 'p1', label: 'Abrir la compuerta de firma', go: true },
      { id: 'p2', label: 'Recalcular contribuciones' },
    ],
  },
};

function ledgerSeed() {
  return [
    { id: 'L-1', texto: 'Clasificó 22 partidas de EVCO-2026-0415', meta: 'Confianza 96%' },
    { id: 'L-2', texto: 'Validó origen y T-MEC de EVCO-2026-0414', meta: '41 entradas previas' },
    { id: 'L-3', texto: 'Calculó contribuciones de EVCO-2026-0408', meta: 'IVA $96,400' },
  ];
}

module.exports = { DECISIONS, SOURCES, CREW, COPILOT, ledgerSeed };
