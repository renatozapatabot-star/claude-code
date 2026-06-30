// CRUZ — operational dataset (mock).
// English code, Spanish domain data. Cross-border (US <-> MX) shipment records.
// This is a deterministic in-memory fixture so the app "works both ways" without a DB.

/** Pipeline of a cross-border crossing, in order. Drives the signature timeline. */
const PIPELINE = [
  { key: 'almacen', label: 'En almacén' },
  { key: 'transito', label: 'En tránsito' },
  { key: 'cruce', label: 'En cruce' },
  { key: 'revision', label: 'En revisión' },
  { key: 'liberado', label: 'Liberado' },
  { key: 'entregado', label: 'Entregado' },
];

/** Status → tone used by the UI for the status dot / pill. */
const STATUS = {
  almacen: { label: 'En almacén', tone: 'neutral', stage: 0 },
  transito: { label: 'En tránsito', tone: 'info', stage: 1 },
  cruce: { label: 'En cruce', tone: 'info', stage: 2 },
  revision: { label: 'En revisión', tone: 'warn', stage: 3 },
  liberado: { label: 'Liberado', tone: 'ok', stage: 4 },
  entregado: { label: 'Entregado', tone: 'done', stage: 5 },
  detenido: { label: 'Detenido', tone: 'alert', stage: 3 },
};

const ADUANAS = ['Nuevo Laredo', 'Colombia', 'Pharr', 'Otay Mesa', 'Reynosa', 'Cd. Juárez'];
const AGENTES = ['Garza Aduanal', 'Treviño & Asoc.', 'Patente 3801', 'Marítima del Norte'];

// Curated rows — believable, varied, and tuned so each status/tone is represented.
const ROWS = [
  ['EVCO-2026-0418', 'Hisense México', 'Monterrey, NL', 'Laredo, TX', 'cruce', 'Nuevo Laredo', 'Garza Aduanal', '26 47 3801 6000412', 'Electrónica de línea blanca', 412800, 1840, 'TX-4471', 'SL-77120', 'DAP', '2026-06-30T14:20:00Z', false],
  ['EVCO-2026-0417', 'Bosch Frenos', 'Toluca, MX', 'El Paso, TX', 'revision', 'Cd. Juárez', 'Treviño & Asoc.', '26 47 3801 6000408', 'Componentes de freno', 268150, 1120, 'CHH-2218', 'SL-77104', 'FCA', '2026-06-30T11:00:00Z', true],
  ['EVCO-2026-0416', 'Lear Asientos', 'Saltillo, MX', 'Arlington, TX', 'transito', 'Colombia', 'Garza Aduanal', null, 'Arneses automotrices', 154300, 980, 'COA-9043', 'SL-77098', 'DDP', '2026-06-30T18:45:00Z', false],
  ['EVCO-2026-0415', 'Whirlpool', 'Ramos Arizpe, MX', 'Cleveland, OH', 'liberado', 'Nuevo Laredo', 'Patente 3801', '26 47 3801 6000399', 'Lavadoras', 533900, 2210, 'TX-4402', 'SL-77051', 'DAP', '2026-06-29T22:10:00Z', false],
  ['EVCO-2026-0414', 'Nemak', 'García, NL', 'Detroit, MI', 'entregado', 'Colombia', 'Garza Aduanal', '26 47 3801 6000371', 'Cabezas de motor (aluminio)', 712400, 3050, 'MI-1180', 'SL-76980', 'DDP', '2026-06-28T16:00:00Z', false],
  ['EVCO-2026-0413', 'Ternium', 'Monterrey, NL', 'Houston, TX', 'detenido', 'Nuevo Laredo', 'Treviño & Asoc.', '26 47 3801 6000365', 'Acero rolado en frío', 489000, 4400, 'TX-3390', 'SL-76944', 'FOB', '2026-06-30T09:30:00Z', true],
  ['EVCO-2026-0412', 'Mabe', 'Celaya, MX', 'San Antonio, TX', 'almacen', 'Pharr', 'Marítima del Norte', null, 'Estufas de gas', 201500, 1660, 'TX-4510', null, 'EXW', '2026-07-01T07:00:00Z', false],
  ['EVCO-2026-0411', 'Continental Tire', 'San Luis Potosí, MX', 'Mt. Vernon, IL', 'transito', 'Reynosa', 'Patente 3801', null, 'Neumáticos para auto', 318700, 2750, 'SLP-7720', 'SL-76901', 'DAP', '2026-06-30T20:00:00Z', false],
  ['EVCO-2026-0410', 'Kia Partes', 'Pesquería, NL', 'West Point, GA', 'cruce', 'Colombia', 'Garza Aduanal', '26 47 3801 6000352', 'Refacciones ensamble', 276900, 1490, 'NL-8841', 'SL-76888', 'FCA', '2026-06-30T13:10:00Z', false],
  ['EVCO-2026-0409', 'Cuervo', 'Tequila, JAL', 'Otay Mesa, CA', 'revision', 'Otay Mesa', 'Marítima del Norte', '26 47 3801 6000340', 'Bebidas espirituosas', 158200, 1230, 'JAL-2204', 'SL-76870', 'CIF', '2026-06-30T10:40:00Z', false],
  ['EVCO-2026-0408', 'Cemex', 'Monterrey, NL', 'Phoenix, AZ', 'liberado', 'Nuevo Laredo', 'Treviño & Asoc.', '26 47 3801 6000331', 'Cemento especializado', 96400, 5200, 'TX-3361', 'SL-76844', 'DAP', '2026-06-29T19:25:00Z', false],
  ['EVCO-2026-0407', 'Grupo Bimbo', 'Azcapotzalco, MX', 'Fort Worth, TX', 'entregado', 'Pharr', 'Patente 3801', '26 47 3801 6000318', 'Producto de panificación', 88200, 940, 'TX-4471', 'SL-76800', 'DDP', '2026-06-28T06:30:00Z', false],
  ['EVCO-2026-0406', 'Katcon', 'Apodaca, NL', 'Spartanburg, SC', 'transito', 'Colombia', 'Garza Aduanal', null, 'Convertidores catalíticos', 402100, 1380, 'NL-8852', 'SL-76781', 'FCA', '2026-07-01T02:00:00Z', false],
  ['EVCO-2026-0405', 'Sigma Alimentos', 'San Pedro, NL', 'Dallas, TX', 'almacen', 'Nuevo Laredo', 'Marítima del Norte', null, 'Cárnicos refrigerados', 134600, 1100, 'TX-4520', null, 'EXW', '2026-07-01T05:30:00Z', false],
];

function buildTimeline(stage, etaIso, detenido) {
  // Construct an honest pipeline: completed stages get a timestamp, current is active, rest pending.
  const base = new Date(etaIso).getTime();
  return PIPELINE.map((p, i) => {
    let state = 'pending';
    if (i < stage) state = 'done';
    else if (i === stage) state = detenido ? 'blocked' : 'active';
    const at = i <= stage ? new Date(base - (stage - i) * 7.5 * 3600 * 1000).toISOString() : null;
    return { ...p, state, at };
  });
}

// Deterministic per-id pseudo-confidence (no Date/random at module load).
function confianza(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return 88 + (h % 12); // 88–99
}
// Semáforo fiscal: customs-inspection light. Honest mapping from operational state.
function semaforo(estado, alerta) {
  if (estado === 'detenido') return { key: 'rojo', label: 'Rojo', tone: 'alert' };
  if (estado === 'revision' || alerta) return { key: 'amarillo', label: 'Amarillo', tone: 'warn' };
  return { key: 'verde', label: 'Verde', tone: 'ok' };
}

const EMBARQUES = ROWS.map((r) => {
  const [id, cliente, origen, destino, estado, aduana, agente, pedimento, mercancia, valor, peso, caja, sello, incoterm, eta, alerta] = r;
  const meta = STATUS[estado];
  const sem = semaforo(estado, alerta);
  return {
    id,
    cliente,
    origen,
    destino,
    estado,
    estadoLabel: meta.label,
    tone: meta.tone,
    stage: meta.stage,
    aduana,
    agente,
    pedimento,
    mercancia,
    valorUsd: valor,
    pesoKg: peso,
    caja,
    sello,
    incoterm,
    eta,
    alerta,
    confianza: confianza(id),                       // /99 model certainty
    semaforo: sem,                                   // verde / amarillo / rojo
    dutiesMxn: Math.round(valor * 16.9 * 0.16),      // illustrative IVA on declared value
    timeline: buildTimeline(meta.stage, eta, estado === 'detenido'),
  };
});

function summary() {
  const counts = {};
  for (const e of EMBARQUES) counts[e.estado] = (counts[e.estado] || 0) + 1;
  const enRuta = EMBARQUES.filter((e) => ['transito', 'cruce', 'revision'].includes(e.estado)).length;
  const atencion = EMBARQUES.filter((e) => e.alerta || e.estado === 'detenido').length;
  const valorEnRuta = EMBARQUES.filter((e) => !['entregado'].includes(e.estado)).reduce((s, e) => s + e.valorUsd, 0);
  return { total: EMBARQUES.length, enRuta, atencion, valorEnRuta, counts };
}

module.exports = { EMBARQUES, PIPELINE, STATUS, ADUANAS, AGENTES, summary };
