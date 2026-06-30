/* ============================================================================
   CRUZ — frontend logic (white+red canon).
   The trust loop is the product: CRUZ prepares → human GOes → 5s undo → logged.
   Bilingual ES/EN. Talks to the local JSON API so it works both ways.
   ========================================================================== */
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fmtUsd = (n) => '$' + n.toLocaleString('en-US');
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---- Bilingual dictionary (subset actually used; ES default) -------------- */
const DICT = {
  es: {
    brandSub: 'EVCO · Patente 3801', nInicio: 'Inicio', grpOps: 'Operación', nShip: 'Embarques',
    nPedimentos: 'Pedimentos', nExpedientes: 'Expedientes', grpAdmin: 'Administración', nFacturacion: 'Facturación',
    nClients: 'Clientes', systemsLive: 'Todo en línea', searchPhShort: 'Buscar embarque, pedimento, cliente…',
    demoBadge: 'DATOS DEMO', newShip: 'Nuevo embarque', tagline: 'El Sistema Operativo Transfronterizo',
    searchPh: 'Pregúntale a CRUZ — "¿Qué se despacha hoy en Laredo?"',
    hintRev: 'En <b>revisión</b>', hintLrd: 'Aduana <b>Nuevo Laredo</b>', hintCli: 'Cliente <b>Nemak</b>', hintHold: 'Carga <b>detenida</b>',
    rs_need: '¿Qué necesita de ti ahora?', rs_queueSub: 'listos para tu firma', recentH: 'Actividad reciente',
    sl_title: 'Embarques', embSub: 'Trazabilidad de cada cruce, de origen a entrega.',
    sl_all: 'Todos', sl_transit: 'En tránsito', fCruce: 'En cruce', fRev: 'En revisión', sl_held: 'Detenidos',
    nShipLc: 'embarques', thEmb: 'Embarque', sl_client: 'Cliente', thRoute: 'Ruta', w_status: 'Estado',
    tc_pedimento: 'Pedimento', thSem: 'Semáforo', thVal: 'Valor USD', undo: 'Deshacer',
    enRuta: 'En ruta', atencion: 'Requieren atención', valorRuta: 'Valor en ruta',
    pendiente: 'Pendiente', conf: 'CONF', sinResultados: 'Sin coincidencias para',
    // copilot
    coWatch: 'Vigilando', coWork: 'Trabajando', coProp: 'Propuesto', coReady: 'Listo para tu firma',
    coSub: 'Agente aduanal · haciendo la labor', assist: 'Nivel de asistencia',
    a_sup: 'Supervisado', a_co: 'Co-piloto', note_sup: 'CRUZ redacta todo; tú apruebas cada paso.',
    note_co: 'CRUZ ejecuta el pedimento; tú firmas lo que tiene peso legal.',
    onPage: 'En esta vista', propuestas: 'Propuestas', shadow: 'Modo sombra · propuesta no activa',
    crew: 'Equipo de agentes · en vivo', askPh: 'Pregunta o comanda a CRUZ…', ledgerH: 'Lo que CRUZ hizo hoy',
    sourcesH: 'Fuentes de datos · en vivo / por activar', live: 'EN VIVO', staged: 'POR ACTIVAR',
    states_idle: 'Inactivo', states_watch: 'Vigilando', states_work: 'Trabajando', states_prop: 'Propuesto', states_await: 'Esperando firma', states_shadow: 'Sombra',
    // gate
    gateEyebrow: 'Compuerta de firma', gateNote: 'Nada se transmite hasta que firmes — luego 5 s para cancelar.',
    gateDeclared: 'Valor declarado', gateDuties: 'Contribuciones (MXN)', firmar: 'Firmar y avanzar', cancelar: 'Cancelar',
    toastSigned: 'firmado · programado a la ventana verde', toastTransmit: 'Transmitido al SAT · tú diste el juicio',
    // placeholder surfaces
    exp_title: 'Expedientes', exp_sub: 'COVE, pedimento, Carta Porte y B/L — todo enlazado.',
    exp_live: 'Documentos en vivo', exp_review: 'Por revisar', exp_valor: 'Valor en tránsito',
    exp_tipo: 'Tipo de documento', exp_ref: 'Referencia', exp_fecha: 'Fecha', exp_doc: 'Documento', exp_linked: 'Enlazado a',
    fac_title: 'Facturación', fac_sub: 'Honorarios RZ&Co, desembolsos y cobranza por cliente.',
    fac_honorarios: 'Honorarios · Mes', fac_desembolsado: 'Desembolsado', fac_cobrado: 'Cobrado a tiempo', fac_vencido: 'Vencido',
    fac_factura: 'Factura', fac_monto: 'Monto', fac_venc: 'Vencimiento', fac_dias: 'días', fac_facturas: 'facturas',
    fac_total: 'Total facturado', fac_honor: 'Honorarios', fac_reemb: 'Reembolsos operativos', fac_ivaL: 'IVA (16%)', fac_integracion: 'Integración contable',
    cli_title: 'Clientes', cli_sub: 'Tu cartera — cada importador en una patente.',
    cli_activos: 'Clientes activos', cli_mve: 'Exposición MVE', cli_cargas: 'Carga total · mes', cli_valor: 'Valor en cartera',
    cli_rfc: 'RFC / Patente', cli_cargas30: 'Cargas 30d', cli_alertas: 'Alertas', cli_valorMes: 'Valor mes',
    cli_identidad: 'Identidad y patente', cli_cumpl: 'Cumplimiento y riesgo', cli_op: 'Operación · 30 días',
    cli_razon: 'Razón social', cli_patente: 'Patente', cli_agente: 'Agente aduanal', cli_activosOp: 'Embarques activos',
    ped_title: 'Pedimentos', ped_sub: 'Línea de despacho — clasificado, validado, costeado, listo para tu firma.',
    ped_preparados: 'Listos para firma', ped_transmitidos: 'Transmitidos al SAT', ped_dutiesK: 'Contribuciones · Mes',
    ped_clave: 'Clave', ped_regimen: 'Régimen', ped_validaciones: 'Validaciones', ped_estado: 'Estado',
    ped_duties: 'Contribuciones MXN', ped_preparado: 'Listo para firma', ped_transmitido: 'Transmitido',
    p_entryHeader: 'Encabezado del pedimento', p_duties: 'Contribuciones e impuestos', p_validation: 'Validación', p_audit: 'Rastro de auditoría',
    au_gen: 'CRUZ generó el pedimento', au_val: '14/14 validaciones SAT aprobadas', au_wait: 'Esperando tu e.firma', au_sent: 'Transmitido al SAT',
    p_transmit: 'Firmar y transmitir al SAT', ped_valorAduana: 'Valor aduana', ped_igi: 'IGI', ped_dta: 'DTA', ped_iva: 'IVA', ped_total: 'Total',
    ped_satOk: 'validaciones SAT aprobadas', ped_mercancia: 'Mercancía', ped_satToast: 'Transmitido al SAT · tú diste el juicio',
  },
  en: {
    brandSub: 'EVCO · Patente 3801', nInicio: 'Home', grpOps: 'Operations', nShip: 'Shipments',
    nPedimentos: 'Pedimentos', nExpedientes: 'Files', grpAdmin: 'Admin', nFacturacion: 'Billing',
    nClients: 'Clients', systemsLive: 'All systems live', searchPhShort: 'Search shipment, pedimento, client…',
    demoBadge: 'DEMO DATA', newShip: 'New shipment', tagline: 'The Cross-Border Operating System',
    searchPh: 'Ask CRUZ anything — "What\'s clearing at Laredo today?"',
    hintRev: 'In <b>review</b>', hintLrd: 'Customs <b>Nuevo Laredo</b>', hintCli: 'Client <b>Nemak</b>', hintHold: 'Cargo <b>held</b>',
    rs_need: 'What needs you right now', rs_queueSub: 'ready for your signature', recentH: 'Recent activity',
    sl_title: 'Shipments', embSub: 'Traceability of every crossing, origin to delivery.',
    sl_all: 'All', sl_transit: 'In transit', fCruce: 'At border', fRev: 'In review', sl_held: 'Held',
    nShipLc: 'shipments', thEmb: 'Shipment', sl_client: 'Client', thRoute: 'Route', w_status: 'Status',
    tc_pedimento: 'Pedimento', thSem: 'Light', thVal: 'Value USD', undo: 'Undo',
    enRuta: 'In transit', atencion: 'Need you', valorRuta: 'Value in transit',
    pendiente: 'Pending', conf: 'CONF', sinResultados: 'No matches for',
    coWatch: 'Watching', coWork: 'Working', coProp: 'Proposed', coReady: 'Ready for your signature',
    coSub: 'Customs agent · doing the labor', assist: 'Assistance level',
    a_sup: 'Supervised', a_co: 'Co-pilot', note_sup: 'CRUZ drafts everything; you approve every step.',
    note_co: 'CRUZ runs the entry; you sign what carries legal weight.',
    onPage: 'On this page', propuestas: 'Proposals', shadow: 'Shadow mode · proposal not live',
    crew: 'Agent crew · live', askPh: 'Ask or command CRUZ…', ledgerH: 'What CRUZ did today',
    sourcesH: 'Data sources · live / staged', live: 'LIVE', staged: 'STAGED',
    states_idle: 'Idle', states_watch: 'Watching', states_work: 'Working', states_prop: 'Proposed', states_await: 'Awaiting', states_shadow: 'Shadow',
    gateEyebrow: 'Signature gate', gateNote: 'Nothing transmits until you sign — then 5s to cancel.',
    gateDeclared: 'Declared value', gateDuties: 'Duties (MXN)', firmar: 'Sign & advance', cancelar: 'Cancel',
    toastSigned: 'signed · scheduled to the green window', toastTransmit: 'Transmitted to SAT · you made the judgment',
    exp_title: 'Files', exp_sub: 'COVE, pedimento, Carta Porte & B/L — all linked.',
    exp_live: 'Documents live', exp_review: 'To review', exp_valor: 'Value in transit',
    exp_tipo: 'Document type', exp_ref: 'Reference', exp_fecha: 'Date', exp_doc: 'Document', exp_linked: 'Linked to',
    fac_title: 'Billing', fac_sub: 'Honorarios RZ&Co, disbursements and per-client collection.',
    fac_honorarios: 'Honorarios · MTD', fac_desembolsado: 'Disbursed', fac_cobrado: 'Collected on time', fac_vencido: 'Overdue',
    fac_factura: 'Invoice', fac_monto: 'Amount', fac_venc: 'Due', fac_dias: 'days', fac_facturas: 'invoices',
    fac_total: 'Total billed', fac_honor: 'Honorarios', fac_reemb: 'Operating disbursements', fac_ivaL: 'IVA (16%)', fac_integracion: 'Accounting integration',
    cli_title: 'Clients', cli_sub: 'Your book of business — every importer on one patente.',
    cli_activos: 'Active clients', cli_mve: 'MVE exposure', cli_cargas: 'Total loads · MTD', cli_valor: 'Book value',
    cli_rfc: 'RFC / Patente', cli_cargas30: 'Loads 30d', cli_alertas: 'Alerts', cli_valorMes: 'Value MTD',
    cli_identidad: 'Identity & patente', cli_cumpl: 'Compliance & risk', cli_op: 'Operation · 30 days',
    cli_razon: 'Legal name', cli_patente: 'Patente', cli_agente: 'Customs broker', cli_activosOp: 'Active shipments',
    ped_title: 'Pedimentos', ped_sub: 'Clearance pipeline — classified, validated, costed, ready for your signature.',
    ped_preparados: 'Ready to sign', ped_transmitidos: 'Transmitted to SAT', ped_dutiesK: 'Duties · MTD',
    ped_clave: 'Code', ped_regimen: 'Regime', ped_validaciones: 'Validations', ped_estado: 'Status',
    ped_duties: 'Duties MXN', ped_preparado: 'Ready to sign', ped_transmitido: 'Transmitted',
    p_entryHeader: 'Entry header', p_duties: 'Duties & taxes', p_validation: 'Validation', p_audit: 'Audit trail',
    au_gen: 'CRUZ drafted the pedimento', au_val: '14/14 SAT validations passed', au_wait: 'Awaiting your e-signature', au_sent: 'Transmitted to SAT',
    p_transmit: 'Sign & transmit to SAT', ped_valorAduana: 'Customs value', ped_igi: 'IGI', ped_dta: 'DTA', ped_iva: 'IVA', ped_total: 'Total',
    ped_satOk: 'SAT validations passed', ped_mercancia: 'Goods', ped_satToast: 'Transmitted to SAT · you made the judgment',
  },
};
let LANG = (() => { try { return localStorage.getItem('cruz.lang') || 'es'; } catch { return 'es'; } })();
const t = (k) => (DICT[LANG][k] ?? DICT.es[k] ?? k);

const state = { embarques: [], summary: null, decisions: [], sources: [], copilot: null, pedimentos: [], pediSummary: null, expedientes: null, clientes: null, facturacion: null, filter: '', view: 'inicio', assist: 'sup', coState: 'watch', ledger: [] };
let undoTimer = null;
const fmtMxn = (n) => 'MXN ' + Math.round(n).toLocaleString('en-US');

async function api(path) {
  const r = await fetch(path, { headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error(`${path} -> ${r.status}`);
  return r.json();
}

/* ---- Boot ----------------------------------------------------------------- */
async function boot() {
  paintSkeletons();
  try {
    const [emb, sum, dec, src, co, ped, exp, cli, fac] = await Promise.all([
      api('/api/embarques'), api('/api/summary'), api('/api/decisions'), api('/api/sources'), api('/api/copilot?view=inicio'),
      api('/api/pedimentos'), api('/api/expedientes'), api('/api/clientes'), api('/api/facturacion'),
    ]);
    state.embarques = emb.results; state.summary = sum; state.decisions = dec.results;
    state.sources = src.results; state.copilot = co; state.ledger = co.ledger.slice();
    state.pedimentos = ped.results; state.pediSummary = ped.summary;
    state.expedientes = exp; state.clientes = cli; state.facturacion = fac;
  } catch (e) { console.error('CRUZ: backend no disponible', e); }
  applyI18n();
  renderNavCounts(); renderHome(); renderEmbarques(); renderPedimentos(); renderSurfaces(); renderCopilot();
  wireNav(); wireCommand(); wireMobile(); wireDrawer(); wireLang(); wireCopilot(); wireGate();
  countUp($('#view-inicio'));
}

/* ---- Polish: skeleton loading + KPI count-up ------------------------------ */
function paintSkeletons() {
  const sk = (w) => `<span class="skel skel-line" style="display:inline-block;width:${w}"></span>`;
  const statSk = `<div class="skel skel-stat"></div>`;
  if ($('#home-stats')) $('#home-stats').innerHTML = statSk.repeat(3);
  if ($('#queue-rows')) $('#queue-rows').innerHTML = `<div class="skel skel-row" style="margin:1px 0"></div>`.repeat(3);
  if ($('#home-recent')) $('#home-recent').innerHTML = [0, 0, 0, 0, 0].map(() => `<tr><td>${sk('120px')}</td><td>${sk('40%')}</td><td>${sk('60%')}</td><td>${sk('70px')}</td></tr>`).join('');
  if ($('#emb-rows')) $('#emb-rows').innerHTML = [0, 0, 0, 0, 0, 0].map(() => `<tr><td colspan="8" style="padding:0"><div class="skel skel-row"></div></td></tr>`).join('');
}
function countUp(scope) {
  if (!scope) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  scope.querySelectorAll('.stat .v').forEach((el) => {
    const node = el.childNodes[0];
    if (!node || node.nodeType !== 3) return;
    const m = node.nodeValue.match(/^(\D*)(-?[\d,]+(?:\.\d+)?)(.*)$/s);
    if (!m) return;
    const prefix = m[1], suffix = m[3];
    const target = parseFloat(m[2].replace(/,/g, ''));
    const dec = (m[2].split('.')[1] || '').length;
    const set = (n) => { node.nodeValue = prefix + n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suffix; };
    if (reduce || isNaN(target)) { set(target); return; }
    set(0);
    const dur = 650; let start = null;
    const step = (ts) => { if (start === null) start = ts; const p = Math.min((ts - start) / dur, 1); set(target * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); else set(target); };
    requestAnimationFrame(step);
  });
}

/* ---- i18n ----------------------------------------------------------------- */
function applyI18n() {
  document.documentElement.lang = LANG;
  $$('[data-i18n]').forEach((el) => { el.innerHTML = t(el.dataset.i18n); });
  $$('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  $$('.lang button').forEach((b) => b.classList.toggle('on', b.dataset.lang === LANG));
}
function wireLang() {
  $$('.lang button').forEach((b) => b.addEventListener('click', () => {
    LANG = b.dataset.lang; try { localStorage.setItem('cruz.lang', LANG); } catch {}
    applyI18n(); renderHome(); renderEmbarques(); renderPedimentos(); renderSurfaces(); renderCopilot(); renderNavCounts();
  }));
}

/* ---- Navigation ----------------------------------------------------------- */
function wireNav() { $$('.nav-item').forEach((b) => b.addEventListener('click', () => go(b.dataset.view))); }
// Copilot state machine: each surface puts the agent in a believable state.
const VIEW_STATE = { inicio: 'watch', embarques: 'watch', pedimentos: 'prop', expedientes: 'work', facturacion: 'work', clientes: 'idle' };
async function go(view) {
  state.view = view;
  $$('.nav-item').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
  $$('.view').forEach((v) => v.classList.toggle('active', v.id === `view-${view}`));
  closeSidebar(); window.scrollTo(0, 0);
  setCoState(VIEW_STATE[view] || 'watch');
  countUp($(`#view-${view}`));
  try { state.copilot = await api('/api/copilot?view=' + encodeURIComponent(view)); renderCopilot(); } catch {}
}

// Cross-fade the copilot pill status when the state changes (200ms).
const CO_STATE_KEY = { idle: 'states_idle', watch: 'states_watch', work: 'states_work', prop: 'states_prop', await: 'states_await', shadow: 'states_shadow' };
function coStatusLine() {
  const n = state.summary ? state.summary.total : 0;
  switch (state.coState) {
    case 'work': return `<b>${t('coWork')}</b> · ${t('states_work').toLowerCase()}`;
    case 'prop': return `<b>${t('coProp')}</b> · ${state.pediSummary ? state.pediSummary.preparados : 0} ${t('ped_estado').toLowerCase()}`;
    case 'idle': return `${t('states_idle')}`;
    default: return `<b>${t('coWatch')}</b> · ${n} ${t('nShipLc')}`;
  }
}
function setCoState(s) {
  if (state.coState === s) return;
  state.coState = s;
  const st = $('#co-pill-st'); const orb = $('#co-pill .orb');
  if (orb) orb.classList.toggle('st-work', s === 'work' || s === 'prop');
  if (!st) return;
  st.classList.add('co-faded');
  setTimeout(() => { st.innerHTML = coStatusLine(); st.classList.remove('co-faded'); }, 200);
  if ($('#co-drawer').classList.contains('open')) renderCopilot();
}
function renderNavCounts() {
  const s = state.summary; if (!s) return;
  $('#nav-emb').textContent = s.total;
  $('#nav-ped').textContent = (s.counts.cruce || 0) + (s.counts.revision || 0) + (s.counts.liberado || 0);
}

/* ---- Inicio: stats, decision queue, recent ------------------------------- */
function renderHome() {
  const s = state.summary;
  if (s) {
    $('#home-stats').innerHTML = [
      stat('i-truck', t('enRuta'), s.enRuta, ''),
      stat('i-warn', t('atencion'), s.atencion, '', s.atencion > 0),
      stat('i-coin', t('valorRuta'), '$' + (s.valorEnRuta / 1e6).toFixed(2), 'M USD'),
    ].join('');
  }
  renderQueue();
  const recent = state.embarques.slice(0, 5);
  $('#home-recent').innerHTML = recent.map((e) => `
    <tr data-id="${esc(e.id)}">
      <td data-l="${t('thEmb')}"><span class="cell-id">${esc(e.id)}</span></td>
      <td data-l="${t('sl_client')}"><span class="cell-cli">${esc(e.cliente)}</span></td>
      <td data-l="${t('thRoute')}"><span class="cell-route">${esc(e.origen)} <span class="arr">→</span> ${esc(e.destino)}</span></td>
      <td data-l="${t('w_status')}"><span class="cell-pill-wrap">${pill(e)}</span></td>
    </tr>`).join('');
  $$('#home-recent tr').forEach((tr) => tr.addEventListener('click', () => openDrawer(tr.dataset.id)));
}
function stat(icon, label, value, unit, attn) {
  return `<button class="stat${attn ? ' attn' : ''}">
    <div class="k"><svg style="width:14px;height:14px"><use href="#${icon}"/></svg>${esc(label)}</div>
    <div class="v">${esc(value)}${unit ? ` <small>${esc(unit)}</small>` : ''}</div></button>`;
}

const AVCOLORS = ['#cf3a22', '#2a6bb0', '#1f8a52', '#b5781a', '#5a6270'];
function avatarColor(name) { let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0; return AVCOLORS[h % AVCOLORS.length]; }
function initials(name) { return name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase(); }

function renderQueue() {
  const rows = state.decisions;
  $('#q-count').textContent = rows.filter((d) => d.kind === 'firma').length;
  $('#queue-rows').innerHTML = rows.map((d) => `
    <div class="dec" data-id="${esc(d.id)}" data-emb="${esc(d.embarque)}">
      <div class="dec-av" style="background:${avatarColor(d.cliente)}">${esc(initials(d.cliente))}</div>
      <div class="dec-main">
        <div class="dec-cli">${esc(d.cliente)} ${d.pedimento ? `<span class="ped">${esc(d.pedimento)}</span>` : ''}</div>
        <div class="dec-t">${esc(d.titulo)}</div>
      </div>
      <div class="dec-right">
        <div class="conf"><div class="n">${d.confianza}<s>/99</s></div><div class="l">${t('conf')}</div></div>
        <span class="sem ${d.semaforo.tone}">${esc(d.semaforo.label)}</span>
        <button class="btn ${d.kind === 'firma' ? 'btn-primary' : ''} dec-cta">${esc(d.accion)}</button>
      </div>
    </div>`).join('');
  $$('#queue-rows .dec').forEach((el) => {
    el.querySelector('.dec-cta').addEventListener('click', (ev) => { ev.stopPropagation();
      const d = state.decisions.find((x) => x.id === el.dataset.id);
      if (d.kind === 'firma') openGate(d); else openDrawer(el.dataset.emb);
    });
    el.addEventListener('click', () => openDrawer(el.dataset.emb));
  });
}

/* ---- Signature gate + 5s undo + ledger ----------------------------------- */
function openGate(d) {
  $('#gate').innerHTML = `
    <div class="gate-top">
      <div class="gate-eyebrow">${t('gateEyebrow')}</div>
      <div class="gate-title">${esc(d.cliente)} · <span class="mono">${esc(d.pedimento || '')}</span></div>
      <div class="gate-body">${esc(d.detalle)}</div>
    </div>
    <div class="gate-kv">
      <div><div class="k">${t('gateDeclared')}</div><div class="v">${fmtUsd(d.valorUsd)} <span style="color:var(--ink-3);font-size:12px">USD</span></div></div>
      <div><div class="k">${t('conf')}</div><div class="v">${d.confianza}<span style="color:var(--ink-4);font-size:12px">/99</span></div></div>
      <div><div class="k">Semáforo</div><div class="v"><span class="sem ${d.semaforo.tone}">${esc(d.semaforo.label)}</span></div></div>
    </div>
    <div class="gate-foot">
      <button class="btn btn-primary" id="gate-sign"><svg class="ico"><use href="#i-check"/></svg>${t('firmar')}</button>
      <button class="btn btn-ghost" id="gate-cancel" style="justify-content:center">${t('cancelar')}</button>
      <div class="gate-note">${t('gateNote')}</div>
    </div>`;
  $('#gate-scrim').classList.add('open');
  $('#gate-sign').addEventListener('click', () => { closeGate(); signDecision(d); });
  $('#gate-cancel').addEventListener('click', closeGate);
}
function closeGate() { $('#gate-scrim').classList.remove('open'); }
function wireGate() { $('#gate-scrim').addEventListener('click', (e) => { if (e.target.id === 'gate-scrim') closeGate(); }); }

function signDecision(d) {
  // Optimistic: remove from queue, show shrinking 5s undo, then "log".
  const idx = state.decisions.findIndex((x) => x.id === d.id);
  const removed = state.decisions[idx];
  state.decisions.splice(idx, 1); renderQueue();
  showToast(`<b>${esc(d.cliente)}</b> ${t('toastSigned')}`, () => {
    state.decisions.splice(idx, 0, removed); renderQueue(); // undo restores
  }, () => {
    // committed → log to copilot ledger
    state.ledger.unshift({ id: 'L-' + Date.now(), texto: `${t('firmar')}: ${d.cliente} · ${d.pedimento || ''}`, meta: t('toastTransmit') });
    if (state.view === 'inicio' || $('#co-drawer').classList.contains('open')) renderCopilot();
  });
}
function showToast(msg, onUndo, onCommit) {
  clearTimeout(undoTimer);
  const toast = $('#toast');
  $('#toast-msg').innerHTML = msg;
  toast.classList.add('show');
  // restart drain animation
  const bar = toast.querySelector('.bar'); bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = '';
  let committed = false;
  const commit = () => { if (committed) return; committed = true; toast.classList.remove('show'); onCommit && onCommit(); };
  undoTimer = setTimeout(commit, 5200);
  $('#toast-undo').onclick = () => { clearTimeout(undoTimer); committed = true; toast.classList.remove('show'); onUndo && onUndo(); };
}

/* ---- Embarques table ------------------------------------------------------ */
function renderEmbarques() {
  const rows = state.embarques.filter((e) => !state.filter || e.estado === state.filter);
  $('#emb-count').textContent = rows.length;
  const tb = $('#emb-rows');
  tb.innerHTML = rows.length ? rows.map(rowHtml).join('') : emptyRow();
  $$('#emb-rows tr[data-id]').forEach((tr) => tr.addEventListener('click', () => openDrawer(tr.dataset.id)));
}
function rowHtml(e) {
  return `<tr data-id="${esc(e.id)}">
    <td><span class="flag">${e.alerta ? '<svg><use href="#i-warn"/></svg>' : ''}</span></td>
    <td data-l="${t('thEmb')}"><span class="cell-id">${esc(e.id)}</span></td>
    <td data-l="${t('sl_client')}"><span class="cell-cli">${esc(e.cliente)}</span></td>
    <td data-l="${t('thRoute')}"><span class="cell-route">${esc(e.origen)} <span class="arr">→</span> ${esc(e.destino)}</span></td>
    <td data-l="${t('w_status')}"><span class="cell-pill-wrap">${pill(e)}</span></td>
    <td data-l="${t('tc_pedimento')}">${e.pedimento ? `<span class="cell-ped">${esc(e.pedimento)}</span>` : `<span class="cell-ped pend">${t('pendiente')}</span>`}</td>
    <td data-l="${t('thSem')}"><span class="sem ${e.semaforo.tone}">${esc(e.semaforo.label)}</span></td>
    <td class="r" data-l="${t('thVal')}"><span class="cell-val">${fmtUsd(e.valorUsd)}</span></td></tr>`;
}
function emptyRow() {
  return `<tr><td colspan="8"><div class="empty"><svg class="mark"><use href="#i-search"/></svg><div>${t('sinResultados')}…</div></div></td></tr>`;
}
function pill(e) { return `<span class="pill ${e.tone}">${esc(e.estadoLabel)}</span>`; }

function wireFilter() {
  $$('#emb-filter button').forEach((b) => b.addEventListener('click', () => {
    state.filter = b.dataset.f;
    $$('#emb-filter button').forEach((x) => x.classList.toggle('on', x === b));
    renderEmbarques();
  }));
}

/* ---- Command search ------------------------------------------------------- */
function wireCommand() {
  wireFilter();
  const top = $('#cmd-top'), home = $('#cmd-home'), pop = $('#cmd-pop');
  let cur = -1, results = [];
  const run = debounce(async (q) => {
    if (!q.trim()) { pop.classList.remove('open'); return; }
    try { const data = await api('/api/embarques?q=' + encodeURIComponent(q)); results = data.results; cur = -1; renderPop(pop, results, q); } catch {}
  }, 110);
  top.addEventListener('input', () => run(top.value));
  top.addEventListener('focus', () => { if (top.value.trim()) run(top.value); });
  top.addEventListener('keydown', (e) => navPop(e, pop));
  document.addEventListener('click', (e) => { if (!e.target.closest('.cmd')) pop.classList.remove('open'); });
  home.addEventListener('input', () => { top.value = home.value; });
  $('#big-form').addEventListener('submit', (e) => { e.preventDefault(); const q = home.value.trim(); if (!q) return; go('embarques'); applyTextFilter(q); top.value = q; });
  $$('#home-hints .chip').forEach((c) => c.addEventListener('click', () => { home.value = c.dataset.q; top.value = c.dataset.q; go('embarques'); applyTextFilter(c.dataset.q); }));
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); top.focus(); top.select(); }
    if (e.key === 'Escape') { pop.classList.remove('open'); closeDrawer(); closeGate(); closeCopilot(); }
  });
}
function renderPop(pop, results, q) {
  if (!results.length) { pop.innerHTML = `<div class="cmd-empty">${t('sinResultados')} “${esc(q)}”.</div>`; pop.classList.add('open'); return; }
  pop.innerHTML = `<div class="grp">${results.length} ${t('nShipLc')}</div>` + results.slice(0, 8).map((e) => `
    <button class="cmd-row" data-id="${esc(e.id)}"><span class="id">${esc(e.id)}</span>
      <span class="who">${esc(e.cliente)} · ${esc(e.origen)} → ${esc(e.destino)}</span>${pill(e)}</button>`).join('');
  pop.classList.add('open');
  $$('.cmd-row', pop).forEach((r) => r.addEventListener('click', () => { pop.classList.remove('open'); openDrawer(r.dataset.id); }));
}
function navPop(e, pop) {
  const rows = $$('.cmd-row', pop); if (!rows.length) return;
  let cur = rows.findIndex((r) => r.classList.contains('cur'));
  if (e.key === 'ArrowDown') { e.preventDefault(); cur = Math.min(cur + 1, rows.length - 1); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); cur = Math.max(cur - 1, 0); }
  else if (e.key === 'Enter') { e.preventDefault(); rows[cur < 0 ? 0 : cur]?.click(); return; }
  else return;
  rows.forEach((r, i) => r.classList.toggle('cur', i === cur)); rows[cur]?.scrollIntoView({ block: 'nearest' });
}
function applyTextFilter(q) {
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const terms = norm(q).split(/\s+/).filter(Boolean);
  state.filter = ''; $$('#emb-filter button').forEach((b) => b.classList.toggle('on', b.dataset.f === ''));
  const all = state.embarques.filter((e) => { const hay = norm([e.id, e.cliente, e.origen, e.destino, e.estadoLabel, e.aduana, e.agente, e.pedimento, e.mercancia].join(' ')); return terms.every((x) => hay.includes(x)); });
  $('#emb-count').textContent = all.length;
  const tb = $('#emb-rows');
  tb.innerHTML = all.length ? all.map(rowHtml).join('') : `<tr><td colspan="8"><div class="empty"><svg class="mark"><use href="#i-search"/></svg><div>${t('sinResultados')} “${esc(q)}”.</div></div></td></tr>`;
  $$('#emb-rows tr[data-id]').forEach((tr) => tr.addEventListener('click', () => openDrawer(tr.dataset.id)));
}

/* ---- Detail drawer + crossing timeline ------------------------------------ */
async function openDrawer(id) {
  let e = state.embarques.find((x) => x.id === id);
  try { e = await api('/api/embarques/' + encodeURIComponent(id)); } catch {}
  if (!e) return;
  const d = $('#drawer');
  d.innerHTML = `
    <div class="drawer-head">
      <div><div class="drawer-id">${esc(e.id)} · ${esc(e.incoterm)}</div>
        <div class="drawer-cli">${esc(e.cliente)}</div>${pill(e)}
        <span class="sem ${e.semaforo.tone}" style="margin-left:8px">${esc(e.semaforo.label)}</span></div>
      <button class="iconbtn x" id="drawer-x" aria-label="Cerrar"><svg><use href="#i-x"/></svg></button>
    </div>
    <div class="drawer-body">
      ${e.alerta || e.estado === 'detenido' ? `<div class="alert-bar"><svg><use href="#i-warn"/></svg><div>${e.estado === 'detenido' ? 'Carga detenida en aduana — requiere acción del agente aduanal.' : 'Marcado para revisión documental — verificar pedimento y factura.'}</div></div>` : ''}
      <div class="section-h">Cruce</div>
      <div class="timeline">${e.timeline.map(tlStep).join('')}</div>
      <div class="section-h">${t('w_status')}</div>
      <div class="kv">
        <div class="full"><div class="k">${t('thRoute')}</div><div class="v">${esc(e.origen)} &nbsp;→&nbsp; ${esc(e.destino)}</div></div>
        <div><div class="k">Aduana</div><div class="v">${esc(e.aduana)}</div></div>
        <div><div class="k">Agente aduanal</div><div class="v">${esc(e.agente)}</div></div>
        <div class="full"><div class="k">${t('tc_pedimento')}</div><div class="v mono">${e.pedimento ? esc(e.pedimento) : t('pendiente')}</div></div>
        <div><div class="k">Mercancía</div><div class="v">${esc(e.mercancia)}</div></div>
        <div><div class="k">${t('gateDeclared')}</div><div class="v">${fmtUsd(e.valorUsd)} <span style="color:var(--ink-3)">USD</span></div></div>
        <div><div class="k">Caja</div><div class="v mono">${esc(e.caja)}</div></div>
        <div><div class="k">Sello</div><div class="v mono">${e.sello ? esc(e.sello) : '—'}</div></div>
        <div><div class="k">${t('conf')}</div><div class="v">${e.confianza}<span style="color:var(--ink-4);font-size:12px">/99</span></div></div>
        <div><div class="k">ETA cruce</div><div class="v">${fmtEta(e.eta)}</div></div>
      </div>
    </div>`;
  d.setAttribute('aria-hidden', 'false'); d.classList.add('open'); $('#scrim').classList.add('open');
  $('#drawer-x').addEventListener('click', closeDrawer);
}
function tlStep(s) {
  const icon = s.state === 'done' ? '<svg><use href="#i-check"/></svg>' : s.state === 'blocked' ? '<svg><use href="#i-x"/></svg>' : '';
  return `<div class="tl-step ${s.state}"><div class="tl-node">${icon}</div><div><div class="tl-lab">${esc(s.label)}</div>${s.at ? `<div class="tl-time">${fmtEta(s.at)}</div>` : ''}</div></div>`;
}
function closeDrawer() { $('#drawer').classList.remove('open'); $('#drawer').setAttribute('aria-hidden', 'true'); $('#scrim').classList.remove('open'); }
function wireDrawer() { $('#scrim').addEventListener('click', closeDrawer); }
function fmtEta(iso) { try { return new Date(iso).toLocaleString(LANG === 'es' ? 'es-MX' : 'en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch { return iso; } }

/* ---- Persistent CRUZ Copilot ---------------------------------------------- */
const STATES = ['idle', 'watch', 'work', 'prop', 'await', 'shadow'];
function renderCopilot() {
  const co = state.copilot; if (!co) return;
  const ctx = co.context;
  $('#co-pill-st').innerHTML = coStatusLine();
  const noteKey = state.assist === 'co' ? 'note_co' : 'note_sup';
  $('#co-drawer').innerHTML = `
    <div class="co-head">
      <span class="orb"></span>
      <div style="flex:1">
        <div class="who">CRUZ <span class="mode">${state.assist === 'co' ? t('a_co') : t('a_sup')}</span></div>
        <div class="st"><span class="dotlive"></span>${t('states_' + state.coState)} · ${esc(t('coSub'))}</div>
      </div>
      <button class="iconbtn" id="co-x" aria-label="Cerrar"><svg><use href="#i-x"/></svg></button>
    </div>
    <div class="co-body">
      <div class="states">${STATES.map((s) => `<button class="${s === state.coState ? 'on' : ''}" data-st="${s}">${t('states_' + s)}</button>`).join('')}</div>

      <div class="assist-h"><svg style="width:13px;height:13px"><use href="#i-bolt"/></svg>${t('assist')}</div>
      <div class="assist">
        <button class="${state.assist === 'sup' ? 'on' : ''}" data-assist="sup">${t('a_sup')}</button>
        <button class="${state.assist === 'co' ? 'on' : ''}" data-assist="co">${t('a_co')}</button>
      </div>
      <div class="assist-note">${t(noteKey)}</div>

      <div class="co-card"><div class="lbl"><svg style="width:12px;height:12px"><use href="#i-search"/></svg>${t('onPage')}</div><div class="txt">${esc(ctx.ve)}</div></div>

      <div class="assist-h" style="margin-top:var(--sp-4)">${t('propuestas')}</div>
      ${ctx.propuestas.map((p) => `<button class="co-prop" data-prop="${esc(p.label)}"><svg class="pi"><use href="#i-bolt"/></svg><span>${esc(p.label)}</span>${p.go ? '<span class="gobadge">GO</span>' : ''}</button>`).join('')}

      <div class="shadow"><svg style="width:13px;height:13px"><use href="#i-shield"/></svg>${t('shadow')}</div>

      <div class="assist-h">${t('crew')}</div>
      <div class="crew">${co.crew.map((c, i) => `<span class="ag${i === 2 ? ' on' : ''}">${esc(c.nombre)}</span>`).join('')}</div>

      <div class="assist-h">${t('ledgerH')}</div>
      <div id="co-ledger">${state.ledger.map(ledHtml).join('')}</div>

      <div class="assist-h" style="margin-top:var(--sp-4)">${t('sourcesH')}</div>
      <div>${state.sources.map((s) => `<div class="src"><span class="nm">${esc(s.nombre)}</span><span class="badge-feed ${s.estado === 'live' ? 'live' : 'staged'}">${s.estado === 'live' ? t('live') : t('staged')}</span></div>`).join('')}</div>
    </div>
    <div class="co-ask"><form id="co-ask-form"><input id="co-ask-input" type="text" placeholder="${esc(t('askPh'))}" autocomplete="off" /><button class="send" type="submit" aria-label="Enviar"><svg><use href="#i-arrow"/></svg></button></form></div>`;

  // wire drawer internals
  $('#co-x').addEventListener('click', closeCopilot);
  $$('#co-drawer .assist button').forEach((b) => b.addEventListener('click', () => { state.assist = b.dataset.assist; renderCopilot(); openCopilot(); }));
  $$('#co-drawer .states button').forEach((b) => b.addEventListener('click', () => { $$('#co-drawer .states button').forEach((x) => x.classList.toggle('on', x === b)); }));
  $$('#co-drawer .co-prop').forEach((b) => b.addEventListener('click', () => {
    state.ledger.unshift({ id: 'L-' + Date.now(), texto: b.dataset.prop, meta: t('coReady') });
    $('#co-ledger').innerHTML = state.ledger.map(ledHtml).join('');
  }));
  $('#co-ask-form').addEventListener('submit', (e) => {
    e.preventDefault(); const v = $('#co-ask-input').value.trim(); if (!v) return;
    state.ledger.unshift({ id: 'L-' + Date.now(), texto: v, meta: t('coWork') });
    $('#co-ledger').innerHTML = state.ledger.map(ledHtml).join(''); $('#co-ask-input').value = '';
  });
}
function ledHtml(l) { return `<div class="led"><span class="ck"><svg><use href="#i-check"/></svg></span><div>${esc(l.texto)}<div class="m">${esc(l.meta)}</div></div></div>`; }
function openCopilot() { $('#co-drawer').classList.add('open'); $('#co-drawer').setAttribute('aria-hidden', 'false'); $('#co-scrim').classList.add('open'); }
function closeCopilot() { $('#co-drawer').classList.remove('open'); $('#co-drawer').setAttribute('aria-hidden', 'true'); $('#co-scrim').classList.remove('open'); }
function wireCopilot() {
  $('#co-pill').addEventListener('click', openCopilot);
  $('#co-scrim').addEventListener('click', closeCopilot);
}

/* ---- Pedimentos (clearance workspace) ------------------------------------- */
function pediEstadoPill(p) {
  return p.estado === 'transmitido'
    ? `<span class="pill done">${t('ped_transmitido')}</span>`
    : `<span class="pill warn">${t('ped_preparado')}</span>`;
}
function renderPedimentos() {
  const s = state.pediSummary;
  const kpis = s ? [
    stat('i-stamp', t('ped_preparados'), s.preparados, '', s.preparados > 0),
    stat('i-check', t('ped_transmitidos'), s.transmitidos, ''),
    stat('i-coin', t('ped_dutiesK'), '$' + (s.dutiesMxn / 1e6).toFixed(2), 'M MXN'),
  ].join('') : '';
  $('#view-pedimentos').innerHTML = `
    <div class="page-head"><div><h1 class="page-title">${t('ped_title')}</h1><div class="page-sub">${t('ped_sub')}</div></div></div>
    <div class="inicio-stats" style="margin:0 0 var(--sp-5)">${kpis}</div>
    <div class="tablewrap">
      <table>
        <thead><tr>
          <th>${t('tc_pedimento')}</th><th>${t('sl_client')}</th><th>${t('ped_clave')}</th>
          <th>${t('ped_validaciones')}</th><th>${t('thSem')}</th><th>${t('ped_estado')}</th><th class="r">${t('ped_duties')}</th>
        </tr></thead>
        <tbody id="ped-rows">${state.pedimentos.map(pediRow).join('')}</tbody>
      </table>
    </div>`;
  $$('#ped-rows tr[data-num]').forEach((tr) => tr.addEventListener('click', () => openPedimento(tr.dataset.num)));
}
function pediRow(p) {
  const v = p.validaciones;
  return `<tr data-num="${esc(p.numero)}">
    <td data-l="${t('tc_pedimento')}"><span class="cell-ped">${esc(p.numero)}</span></td>
    <td data-l="${t('sl_client')}"><span class="cell-cli">${esc(p.cliente)}</span></td>
    <td data-l="${t('ped_clave')}"><span class="mono">${esc(p.clave)}</span></td>
    <td data-l="${t('ped_validaciones')}"><span class="mono" style="color:var(--ok)">${v.pasadas}/${v.total}</span></td>
    <td data-l="${t('thSem')}"><span class="sem ${p.semaforo.tone}">${esc(p.semaforo.label)}</span></td>
    <td data-l="${t('ped_estado')}"><span class="cell-pill-wrap">${pediEstadoPill(p)}</span></td>
    <td class="r" data-l="${t('ped_duties')}"><span class="cell-val">${fmtMxn(p.totalMxn).replace('MXN ', '')}</span></td></tr>`;
}
function pediAudit(p) {
  const base = new Date(p.eta).getTime();
  const steps = [
    { label: t('au_gen'), state: 'done', at: new Date(base - 3 * 36e5).toISOString() },
    { label: t('au_val'), state: 'done', at: new Date(base - 2 * 36e5).toISOString() },
  ];
  steps.push(p.estado === 'transmitido'
    ? { label: t('au_sent'), state: 'done', at: new Date(base - 1 * 36e5).toISOString() }
    : { label: t('au_wait'), state: 'active', at: null });
  return steps;
}
async function openPedimento(num) {
  let p = state.pedimentos.find((x) => x.numero === num);
  try { p = await api('/api/pedimentos/' + encodeURIComponent(num)); } catch {}
  if (!p) return;
  const v = p.validaciones;
  const d = $('#drawer');
  d.innerHTML = `
    <div class="drawer-head">
      <div><div class="drawer-id">${t('tc_pedimento')} · ${esc(p.clave)}</div>
        <div class="drawer-cli mono" style="font-size:16px">${esc(p.numero)}</div>
        ${pediEstadoPill(p)} <span class="sem ${p.semaforo.tone}" style="margin-left:8px">${esc(p.semaforo.label)}</span></div>
      <button class="iconbtn x" id="drawer-x" aria-label="Cerrar"><svg><use href="#i-x"/></svg></button>
    </div>
    <div class="drawer-body">
      <div class="section-h">${t('p_entryHeader')}</div>
      <div class="kv">
        <div><div class="k">${t('sl_client')}</div><div class="v">${esc(p.cliente)}</div></div>
        <div><div class="k">Aduana</div><div class="v">${esc(p.aduana)}</div></div>
        <div><div class="k">${t('ped_clave')}</div><div class="v mono">${esc(p.clave)} · ${esc(p.regimen)}</div></div>
        <div><div class="k">Agente aduanal</div><div class="v">${esc(p.agente)}</div></div>
        <div><div class="k">${t('ped_valorAduana')}</div><div class="v">${fmtUsd(p.valorAduanaUsd)} <span style="color:var(--ink-3)">USD</span></div></div>
        <div><div class="k">${t('ped_mercancia')}</div><div class="v">${esc(p.mercancia)}</div></div>
      </div>
      <div class="section-h">${t('p_duties')}</div>
      <div class="kv">
        <div><div class="k">${t('ped_igi')}</div><div class="v mono">${fmtMxn(p.igiMxn)}</div></div>
        <div><div class="k">${t('ped_dta')}</div><div class="v mono">${fmtMxn(p.dtaMxn)}</div></div>
        <div><div class="k">${t('ped_iva')}</div><div class="v mono">${fmtMxn(p.ivaMxn)}</div></div>
        <div><div class="k">${t('ped_total')}</div><div class="v mono" style="color:var(--cruz-press)">${fmtMxn(p.totalMxn)}</div></div>
      </div>
      <div class="section-h">${t('p_validation')}</div>
      <div class="co-card" style="display:flex;align-items:center;gap:10px;margin-top:0">
        <span class="ck" style="color:var(--ok)"><svg style="width:18px;height:18px"><use href="#i-check"/></svg></span>
        <div><b class="mono">${v.pasadas}/${v.total}</b> ${t('ped_satOk')}</div>
      </div>
      <div class="section-h">${t('p_audit')}</div>
      <div class="timeline">${pediAudit(p).map(tlStep).join('')}</div>
      ${p.estado === 'preparado' ? `<button class="btn btn-primary" id="ped-sign" style="width:100%;justify-content:center;height:46px;margin-top:var(--sp-4)"><svg class="ico"><use href="#i-stamp"/></svg>${t('p_transmit')}</button>
      <div class="gate-note" style="margin-top:8px">${t('gateNote')}</div>` : ''}
    </div>`;
  d.setAttribute('aria-hidden', 'false'); d.classList.add('open'); $('#scrim').classList.add('open');
  $('#drawer-x').addEventListener('click', closeDrawer);
  const sign = $('#ped-sign');
  if (sign) sign.addEventListener('click', () => {
    closeDrawer();
    showToast(`<b>${esc(p.numero)}</b> · ${t('ped_satToast')}`, null, () => {
      state.ledger.unshift({ id: 'L-' + Date.now(), texto: `${t('p_transmit')}: ${p.cliente} · ${p.numero}`, meta: t('ped_satToast') });
    });
  });
}

/* ---- Expedientes (Document Hub) ------------------------------------------- */
function renderSurfaces() { renderExpedientes(); renderFacturacion(); renderClientes(); }
function kpiRow(items) { return `<div class="inicio-stats" style="margin:0 0 var(--sp-5)">${items.join('')}</div>`; }

function renderExpedientes() {
  const s = state.expedientes && state.expedientes.summary;
  const rows = (state.expedientes && state.expedientes.results) || [];
  const kpis = s ? kpiRow([
    stat('i-doc', t('exp_live'), s.live, ''),
    stat('i-warn', t('exp_review'), s.review, '', s.review > 0),
    stat('i-coin', t('exp_valor'), '$' + (s.valorUsd / 1e6).toFixed(2), 'M USD'),
  ]) : '';
  $('#view-expedientes').innerHTML = `
    <div class="page-head"><div><h1 class="page-title">${t('exp_title')}</h1><div class="page-sub">${t('exp_sub')}</div></div></div>
    ${kpis}
    <div class="tablewrap"><table>
      <thead><tr><th>${t('exp_tipo')}</th><th>${t('exp_ref')}</th><th>${t('thEmb')}</th><th>${t('sl_client')}</th><th>${t('exp_fecha')}</th><th>${t('w_status')}</th><th class="r">${t('thVal')}</th></tr></thead>
      <tbody>${rows.map((d) => `
        <tr>
          <td data-l="${t('exp_tipo')}"><span class="cell-cli">${esc(d.docType)}</span></td>
          <td data-l="${t('exp_ref')}"><span class="cell-ped">${esc(d.referencia)}</span></td>
          <td data-l="${t('thEmb')}"><span class="cell-id">${esc(d.embarque)}</span></td>
          <td data-l="${t('sl_client')}">${esc(d.cliente)}</td>
          <td data-l="${t('exp_fecha')}">${fmtDate(d.fechaEmision)}</td>
          <td data-l="${t('w_status')}"><span class="cell-pill-wrap"><span class="pill ${d.estado.tone}">${esc(d.estado.label)}</span></span></td>
          <td class="r" data-l="${t('thVal')}"><span class="cell-val">${fmtUsd(d.valorUsd)}</span></td>
        </tr>`).join('')}</tbody>
    </table></div>`;
}

/* ---- Facturación (Billing) ------------------------------------------------ */
function renderFacturacion() {
  const s = state.facturacion && state.facturacion.summary;
  const rows = (state.facturacion && state.facturacion.results) || [];
  const kpis = s ? kpiRow([
    stat('i-coin', t('fac_honorarios'), '$' + (s.honorariosMxn / 1e6).toFixed(2), 'M MXN'),
    stat('i-coin', t('fac_desembolsado'), '$' + (s.desembolsadoMxn / 1e6).toFixed(2), 'M MXN'),
    stat('i-check', t('fac_cobrado'), s.cobradoPct + '%', ''),
    stat('i-warn', t('fac_vencido'), s.vencidasN, t('fac_facturas'), s.vencidasN > 0),
  ]) : '';
  $('#view-facturacion').innerHTML = `
    <div class="page-head"><div><h1 class="page-title">${t('fac_title')}</h1><div class="page-sub">${t('fac_sub')}</div></div></div>
    ${kpis}
    <div class="tablewrap"><table>
      <thead><tr><th>${t('fac_factura')}</th><th>${t('sl_client')}</th><th class="r">${t('fac_monto')}</th><th>${t('w_status')}</th><th>${t('fac_venc')}</th><th>e.conta</th></tr></thead>
      <tbody>${rows.map((f) => `
        <tr>
          <td data-l="${t('fac_factura')}"><span class="cell-ped">${esc(f.folio)}</span></td>
          <td data-l="${t('sl_client')}"><span class="cell-cli">${esc(f.cliente)}</span></td>
          <td class="r" data-l="${t('fac_monto')}"><span class="cell-val">${fmtMxn(f.totalMxn)}</span></td>
          <td data-l="${t('w_status')}"><span class="cell-pill-wrap"><span class="pill ${f.status.tone}">${esc(f.status.label)}</span></span></td>
          <td data-l="${t('fac_venc')}"><span class="${f.diasVenc < 0 ? '' : ''}" style="color:${f.diasVenc < 0 ? 'var(--alert)' : 'var(--ink-2)'}">${f.diasVenc < 0 ? Math.abs(f.diasVenc) + ' ' + t('fac_dias') + ' ●' : '+' + f.diasVenc + ' ' + t('fac_dias')}</span></td>
          <td data-l="e.conta"><span class="badge-feed ${f.fuente === 'live' ? 'live' : 'staged'}">${f.fuente === 'live' ? t('live') : t('staged')}</span></td>
        </tr>`).join('')}</tbody>
    </table></div>`;
}

/* ---- Clientes (Cartera) --------------------------------------------------- */
function renderClientes() {
  const s = state.clientes && state.clientes.summary;
  const rows = (state.clientes && state.clientes.results) || [];
  const kpis = s ? kpiRow([
    stat('i-users', t('cli_activos'), s.activos, ''),
    stat('i-shield', t('cli_mve'), s.mve + '%', ''),
    stat('i-truck', t('cli_cargas'), s.cargas, ''),
    stat('i-coin', t('cli_valor'), '$' + (s.valorUsd / 1e6).toFixed(1), 'M USD'),
  ]) : '';
  $('#view-clientes').innerHTML = `
    <div class="page-head"><div><h1 class="page-title">${t('cli_title')}</h1><div class="page-sub">${t('cli_sub')}</div></div></div>
    ${kpis}
    <div class="tablewrap"><table>
      <thead><tr><th>${t('sl_client')}</th><th>${t('cli_rfc')}</th><th class="r">${t('cli_cargas30')}</th><th class="r">MVE</th><th class="r">${t('cli_alertas')}</th><th>${t('thSem')}</th><th class="r">${t('cli_valorMes')}</th></tr></thead>
      <tbody>${rows.map((c) => `
        <tr data-cli="${esc(c.nombre)}">
          <td data-l="${t('sl_client')}"><div style="display:flex;align-items:center;gap:10px"><span class="dec-av" style="width:30px;height:30px;border-radius:8px;font-size:11px;background:${avatarColor(c.nombre)}">${esc(initials(c.nombre))}</span><span class="cell-cli">${esc(c.nombre)}</span></div></td>
          <td data-l="${t('cli_rfc')}"><span class="cell-ped">${esc(c.rfc)}</span> <span style="color:var(--ink-4)">· ${esc(c.patente)}</span></td>
          <td class="r" data-l="${t('cli_cargas30')}"><span class="num">${c.cargas30d}</span></td>
          <td class="r" data-l="MVE"><span class="num" style="color:${c.mve >= 90 ? 'var(--ok)' : 'var(--warn)'}">${c.mve}%</span></td>
          <td class="r" data-l="${t('cli_alertas')}"><span class="num" style="color:${c.alertas > 0 ? 'var(--alert)' : 'var(--ink-4)'}">${c.alertas}</span></td>
          <td data-l="${t('thSem')}"><span class="sem ${c.semaforo.tone}">${esc(c.semaforo.label)}</span></td>
          <td class="r" data-l="${t('cli_valorMes')}"><span class="cell-val">${fmtUsd(c.valorMesUsd)}</span></td>
        </tr>`).join('')}</tbody>
    </table></div>`;
  $$('#view-clientes tr[data-cli]').forEach((tr) => tr.addEventListener('click', () => openCliente(tr.dataset.cli)));
}
function openCliente(name) {
  const c = (state.clientes.results || []).find((x) => x.nombre === name); if (!c) return;
  const d = $('#drawer');
  d.innerHTML = `
    <div class="drawer-head">
      <div style="display:flex;align-items:center;gap:12px">
        <span class="dec-av" style="width:42px;height:42px;border-radius:10px;font-size:15px;background:${avatarColor(c.nombre)}">${esc(initials(c.nombre))}</span>
        <div><div class="drawer-cli" style="margin:0">${esc(c.nombre)}</div><div class="drawer-id mono">${esc(c.rfc)}</div></div>
      </div>
      <button class="iconbtn x" id="drawer-x" aria-label="Cerrar"><svg><use href="#i-x"/></svg></button>
    </div>
    <div class="drawer-body">
      <div class="section-h">${t('cli_identidad')}</div>
      <div class="kv">
        <div><div class="k">${t('cli_patente')}</div><div class="v mono">${esc(c.patente)}</div></div>
        <div><div class="k">${t('cli_agente')}</div><div class="v">${esc(c.agente)}</div></div>
        <div><div class="k">${t('thSem')}</div><div class="v"><span class="sem ${c.semaforo.tone}">${esc(c.semaforo.label)}</span></div></div>
        <div><div class="k">${t('cli_alertas')}</div><div class="v" style="color:${c.alertas > 0 ? 'var(--alert)' : 'var(--ink)'}">${c.alertas}</div></div>
      </div>
      <div class="section-h">${t('cli_cumpl')}</div>
      <div class="kv">
        <div><div class="k">${t('cli_mve')}</div><div class="v" style="color:${c.mve >= 90 ? 'var(--ok)' : 'var(--warn)'}">${c.mve}%</div></div>
        <div><div class="k">${t('cli_cargas30')}</div><div class="v num">${c.cargas30d}</div></div>
      </div>
      <div class="section-h">${t('cli_op')}</div>
      <div class="kv">
        <div><div class="k">${t('cli_activosOp')}</div><div class="v num">${c.activos}</div></div>
        <div><div class="k">${t('cli_valorMes')}</div><div class="v">${fmtUsd(c.valorMesUsd)} <span style="color:var(--ink-3)">USD</span></div></div>
      </div>
    </div>`;
  d.setAttribute('aria-hidden', 'false'); d.classList.add('open'); $('#scrim').classList.add('open');
  $('#drawer-x').addEventListener('click', closeDrawer);
}
function fmtDate(iso) { try { return new Date(iso).toLocaleDateString(LANG === 'es' ? 'es-MX' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return iso; } }

/* ---- Mobile sidebar ------------------------------------------------------- */
function wireMobile() {
  $('#hamburger').addEventListener('click', () => { $('#sidebar').classList.toggle('open'); $('#scrim-side').classList.toggle('open'); });
  $('#scrim-side').addEventListener('click', closeSidebar);
}
function closeSidebar() { $('#sidebar').classList.remove('open'); $('#scrim-side').classList.remove('open'); }

function debounce(fn, ms) { let tmr; return (...a) => { clearTimeout(tmr); tmr = setTimeout(() => fn(...a), ms); }; }
document.addEventListener('DOMContentLoaded', boot);
