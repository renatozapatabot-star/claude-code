// CRUZ — Expedientes, Facturación, Clientes. Derived deterministically from the
// embarques/pedimentos fixtures so figures stay internally consistent (DATOS DEMO).
// No Date.now()/random at load — stable across reloads.

const { EMBARQUES } = require('./embarques');
const { PEDIMENTOS } = require('./pedimentos');

const FX = 16.9;
const hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };

// ---- Expedientes (Document Hub) ------------------------------------------
// docState: validado (ok) · por_revisar (warn) · retenido (alert)
function docStateFor(e) {
  if (e.estado === 'detenido') return { key: 'retenido', label: 'Retenido', tone: 'alert' };
  if (e.estado === 'revision' || !e.pedimento) return { key: 'por_revisar', label: 'Por revisar', tone: 'warn' };
  return { key: 'validado', label: 'Validado', tone: 'ok' };
}
const DOC_TYPES = ['COVE', 'Pedimento', 'Carta Porte', 'B/L'];
const EXPEDIENTES = EMBARQUES.flatMap((e) => {
  const st = docStateFor(e);
  const types = e.pedimento ? DOC_TYPES : DOC_TYPES.filter((d) => d !== 'Pedimento');
  return types.map((docType, i) => ({
    docType,
    referencia: docType === 'Pedimento' ? e.pedimento : `${docType.replace(/\W/g, '').toUpperCase().slice(0, 4)}-${(hash(e.id + docType) % 900000 + 100000)}`,
    embarque: e.id,
    cliente: e.cliente,
    fechaEmision: new Date(new Date(e.eta).getTime() - (i + 2) * 36e5).toISOString(),
    estado: docType === 'Pedimento' ? { key: 'validado', label: 'Validado', tone: 'ok' } : st,
    valorUsd: e.valorUsd,
    aduana: e.aduana,
  }));
});
function expedientesSummary() {
  const live = EXPEDIENTES.filter((d) => d.estado.key === 'validado').length;
  const review = EXPEDIENTES.filter((d) => d.estado.key !== 'validado').length;
  const valor = EMBARQUES.filter((e) => !['entregado'].includes(e.estado)).reduce((s, e) => s + e.valorUsd, 0);
  return { total: EXPEDIENTES.length, live, review, valorUsd: valor };
}

// ---- Clientes (Cartera) ---------------------------------------------------
function rfc(name) {
  const letters = (name.replace(/[^A-Za-zÁÉÍÓÚÑ ]/g, '').toUpperCase().split(/\s+/).map((w) => w[0]).join('') + 'XXXX').slice(0, 3);
  const h = hash(name);
  const n = String(h % 1000000).padStart(6, '0');
  const a = 'ABCDEFGHJ'[h % 9] + 'K12'[h % 3] + (h % 9);
  return `${letters}${n}${a}`;
}
const CLIENTES = (() => {
  const map = new Map();
  for (const e of EMBARQUES) {
    if (!map.has(e.cliente)) map.set(e.cliente, []);
    map.get(e.cliente).push(e);
  }
  return [...map.entries()].map(([name, list]) => {
    const h = hash(name);
    const worst = list.reduce((acc, e) => Math.max(acc, { verde: 0, amarillo: 1, rojo: 2 }[e.semaforo.key]), 0);
    const sem = [{ key: 'verde', label: 'Verde', tone: 'ok' }, { key: 'amarillo', label: 'Amarillo', tone: 'warn' }, { key: 'rojo', label: 'Rojo', tone: 'alert' }][worst];
    return {
      nombre: name,
      rfc: rfc(name),
      patente: '3801',
      agente: list[0].agente,
      cargas30d: list.length * 4 + (h % 9),
      mve: 88 + (h % 11),
      alertas: list.filter((e) => e.alerta || e.estado === 'detenido').length,
      semaforo: sem,
      valorMesUsd: list.reduce((s, e) => s + e.valorUsd, 0),
      activos: list.filter((e) => !['entregado'].includes(e.estado)).length,
    };
  }).sort((a, b) => b.valorMesUsd - a.valorMesUsd);
})();
function clientesSummary() {
  const mve = Math.round(CLIENTES.reduce((s, c) => s + c.mve, 0) / CLIENTES.length);
  return {
    activos: CLIENTES.filter((c) => c.activos > 0).length,
    mve,
    cargas: CLIENTES.reduce((s, c) => s + c.cargas30d, 0),
    valorUsd: CLIENTES.reduce((s, c) => s + c.valorMesUsd, 0),
  };
}

// ---- Facturación (Billing) ------------------------------------------------
// status: vigente (ok) · proximo (warn) · vencido (alert)
const FACTURAS = CLIENTES.map((c, i) => {
  const h = hash(c.nombre + 'fac');
  const honorariosMxn = Math.round((c.valorMesUsd * FX) * 0.012);
  const reembolsosMxn = Math.round(c.valorMesUsd * FX * 0.16);
  const subtotal = honorariosMxn + reembolsosMxn;
  const ivaMxn = Math.round(honorariosMxn * 0.16);
  const totalMxn = subtotal + ivaMxn;
  const statusKey = i % 5 === 1 ? 'vencido' : i % 3 === 0 ? 'proximo' : 'vigente';
  const status = { vencido: { label: 'Vencido', tone: 'alert' }, proximo: { label: 'Próximo', tone: 'warn' }, vigente: { label: 'Al corriente', tone: 'ok' } }[statusKey];
  return {
    folio: `RZ-${8800 + (h % 200)}`,
    cliente: c.nombre,
    honorariosMxn, reembolsosMxn, ivaMxn, totalMxn,
    status, statusKey,
    diasVenc: statusKey === 'vencido' ? -(h % 18 + 2) : (h % 40 + 5),
    poliza: `2026${String(6).padStart(2, '0')}-${h % 9000 + 1000}`,
    fuente: i % 4 === 3 ? 'staged' : 'live',
  };
});
function facturacionSummary() {
  const honorarios = FACTURAS.reduce((s, f) => s + f.honorariosMxn, 0);
  const desembolsado = FACTURAS.reduce((s, f) => s + f.reembolsosMxn, 0);
  const vencidas = FACTURAS.filter((f) => f.statusKey === 'vencido');
  return {
    honorariosMxn: honorarios, desembolsadoMxn: desembolsado,
    cobradoPct: 94, vencidasN: vencidas.length,
    vencidoMxn: vencidas.reduce((s, f) => s + f.totalMxn, 0),
  };
}

module.exports = { EXPEDIENTES, expedientesSummary, CLIENTES, clientesSummary, FACTURAS, facturacionSummary };
