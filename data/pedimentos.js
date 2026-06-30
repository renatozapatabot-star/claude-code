// CRUZ — pedimentos (customs entries). Derived from embarques that have been
// classified. Encodes the clearance pipeline that culminates in the signature gate:
// CRUZ prepares the entry → the human signs → it transmits to SAT.
// Duty math is illustrative (DATOS DEMO) but internally consistent.

const { EMBARQUES } = require('./embarques');

const FX = 16.9; // illustrative USD→MXN

// Clave de pedimento → régimen. A1 = importación definitiva; IN = temporal IMMEX.
const CLAVES = { A1: 'Importación definitiva', IN: 'Importación temporal (IMMEX)' };

function claveFor(estado, id) {
  // Stable per-id pick so temporary-import cases stay consistent across reloads.
  let h = 0; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % 4 === 0 ? 'IN' : 'A1';
}

// estado del pedimento: preparado (espera firma) · transmitido (presentado al SAT)
function estadoPedi(estado) {
  return ['liberado', 'entregado'].includes(estado) ? 'transmitido' : 'preparado';
}

const PEDIMENTOS = EMBARQUES.filter((e) => e.pedimento).map((e) => {
  const valorAduanaUsd = e.valorUsd;
  const clave = claveFor(e.estado, e.id);
  // T-MEC: most qualifying goods clear at IGI $0; temporal imports defer IVA.
  const igiMxn = clave === 'IN' ? 0 : Math.round(valorAduanaUsd * FX * 0.0); // qualified T-MEC
  const dtaMxn = 382; // derecho de trámite aduanero (illustrative flat)
  const ivaMxn = clave === 'IN' ? 0 : Math.round(valorAduanaUsd * FX * 0.16);
  const totalMxn = igiMxn + dtaMxn + ivaMxn;
  const estado = estadoPedi(e.estado);
  return {
    numero: e.pedimento,
    embarque: e.id,
    cliente: e.cliente,
    aduana: e.aduana,
    agente: e.agente,
    clave,
    regimen: CLAVES[clave],
    valorAduanaUsd,
    fx: FX,
    igiMxn, dtaMxn, ivaMxn, totalMxn,
    validaciones: { pasadas: 14, total: 14 },
    confianza: e.confianza,
    semaforo: e.semaforo,
    estado,
    eta: e.eta,
    incoterm: e.incoterm,
    mercancia: e.mercancia,
  };
});

function pediSummary() {
  const preparados = PEDIMENTOS.filter((p) => p.estado === 'preparado').length;
  const transmitidos = PEDIMENTOS.filter((p) => p.estado === 'transmitido').length;
  const dutiesMxn = PEDIMENTOS.reduce((s, p) => s + p.totalMxn, 0);
  return { total: PEDIMENTOS.length, preparados, transmitidos, dutiesMxn };
}

module.exports = { PEDIMENTOS, pediSummary };
