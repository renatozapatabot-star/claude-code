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

// HS classification by goods keyword (illustrative LIGIE fractions).
function clasificar(merc, conf) {
  const m = (merc || '').toLowerCase();
  const table = [
    [/lavadora|línea blanca|electrón/, '8450.20.01', 'Máquinas para lavar ropa, capacidad > 10 kg'],
    [/estufa|gas/, '7321.11.01', 'Aparatos de cocción de combustibles gaseosos'],
    [/freno|componente/, '8708.30.03', 'Frenos y servofrenos; sus partes, para vehículos'],
    [/arnés|arnes/, '8544.30.99', 'Juegos de cables para bujías; arneses automotrices'],
    [/cabeza|aluminio|nemak/, '8409.91.99', 'Partes identificables para motores de émbolo'],
    [/acero|rolado/, '7209.16.01', 'Productos laminados planos de acero, en frío'],
    [/neumátic|llanta/, '4011.10.07', 'Neumáticos nuevos de caucho, para automóviles'],
    [/catalític|convertidor/, '8421.39.99', 'Convertidores catalíticos; aparatos de filtrado'],
    [/cemento/, '2523.29.99', 'Cemento Portland, excepto blanco'],
    [/bebida|espirituos|tequila/, '2208.90.04', 'Bebidas espirituosas, las demás'],
    [/panific|pan/, '1905.90.99', 'Productos de panadería, los demás'],
    [/cárnic|carne/, '0202.30.01', 'Carne de bovino deshuesada, congelada'],
  ];
  const hit = table.find(([re]) => re.test(m)) || [/x/, '8708.99.99', 'Las demás partes y accesorios de vehículos'];
  const [, fraccion, desc] = hit;
  return {
    fraccion,
    descripcion: desc,
    confianza: conf,
    razon: `Clasificada en la fracción ${fraccion} por uso final y composición; origen T-MEC calificado por Valor de Contenido Regional.`,
    citas: ['LIGIE 2022 · Regla General 1ª', `T-MEC Anexo 4-B · regla de origen ${fraccion.slice(0, 4)}`, 'Nota Explicativa del SA'],
    alternativas: [{ fraccion: fraccion.slice(0, 5) + '.99.99', nota: 'descartada — no corresponde al uso final declarado' }],
  };
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
    clasificacion: clasificar(e.mercancia, e.confianza),
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
