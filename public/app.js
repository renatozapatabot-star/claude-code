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
    ph_pedimentos: ['Pedimentos', 'Línea de despacho — clasificado, validado, costeado, listo para tu firma.'],
    ph_expedientes: ['Expedientes', 'COVE, pedimento, Carta Porte, DODA y B/L — todo enlazado.'],
    ph_facturacion: ['Facturación', 'Honorarios, desembolsos y cobranza por cliente.'],
    ph_clientes: ['Clientes', 'Tu cartera — cada importador en una patente.'],
    phBuilding: 'Superficie en construcción', phShares: 'Comparte el mismo sistema de diseño de CRUZ.',
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
    ph_pedimentos: ['Pedimentos', 'Clearance pipeline — classified, validated, costed, ready for your signature.'],
    ph_expedientes: ['Files', 'COVE, pedimento, Carta Porte, DODA & B/L — all linked.'],
    ph_facturacion: ['Billing', 'Honorarios, disbursements and per-client collection.'],
    ph_clientes: ['Clients', 'Your book of business — every importer on one patente.'],
    phBuilding: 'Surface under construction', phShares: 'Shares the same CRUZ design system.',
  },
};
let LANG = (() => { try { return localStorage.getItem('cruz.lang') || 'es'; } catch { return 'es'; } })();
const t = (k) => (DICT[LANG][k] ?? DICT.es[k] ?? k);

const state = { embarques: [], summary: null, decisions: [], sources: [], copilot: null, filter: '', view: 'inicio', assist: 'sup', ledger: [] };
let undoTimer = null;

async function api(path) {
  const r = await fetch(path, { headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error(`${path} -> ${r.status}`);
  return r.json();
}

/* ---- Boot ----------------------------------------------------------------- */
async function boot() {
  try {
    const [emb, sum, dec, src, co] = await Promise.all([
      api('/api/embarques'), api('/api/summary'), api('/api/decisions'), api('/api/sources'), api('/api/copilot?view=inicio'),
    ]);
    state.embarques = emb.results; state.summary = sum; state.decisions = dec.results;
    state.sources = src.results; state.copilot = co; state.ledger = co.ledger.slice();
  } catch (e) { console.error('CRUZ: backend no disponible', e); }
  applyI18n();
  renderNavCounts(); renderHome(); renderEmbarques(); renderPlaceholders(); renderCopilot();
  wireNav(); wireCommand(); wireMobile(); wireDrawer(); wireLang(); wireCopilot(); wireGate();
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
    applyI18n(); renderHome(); renderEmbarques(); renderPlaceholders(); renderCopilot(); renderNavCounts();
  }));
}

/* ---- Navigation ----------------------------------------------------------- */
function wireNav() { $$('.nav-item').forEach((b) => b.addEventListener('click', () => go(b.dataset.view))); }
async function go(view) {
  state.view = view;
  $$('.nav-item').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
  $$('.view').forEach((v) => v.classList.toggle('active', v.id === `view-${view}`));
  closeSidebar(); window.scrollTo(0, 0);
  try { state.copilot = await api('/api/copilot?view=' + encodeURIComponent(view)); renderCopilot(); } catch {}
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
  $('#co-pill-st').innerHTML = `<b>${t('coWatch')}</b> · ${state.summary ? state.summary.total : 0} ${t('nShipLc')}`;
  const noteKey = state.assist === 'co' ? 'note_co' : 'note_sup';
  $('#co-drawer').innerHTML = `
    <div class="co-head">
      <span class="orb"></span>
      <div style="flex:1">
        <div class="who">CRUZ <span class="mode">${state.assist === 'co' ? t('a_co') : t('a_sup')}</span></div>
        <div class="st"><span class="dotlive"></span>${t('coWatch')} · ${esc(t('coSub'))}</div>
      </div>
      <button class="iconbtn" id="co-x" aria-label="Cerrar"><svg><use href="#i-x"/></svg></button>
    </div>
    <div class="co-body">
      <div class="states">${STATES.map((s, i) => `<button class="${i === 1 ? 'on' : ''}" data-st="${s}">${t('states_' + s)}</button>`).join('')}</div>

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

/* ---- Placeholder surfaces ------------------------------------------------- */
function renderPlaceholders() {
  for (const k of ['pedimentos', 'expedientes', 'facturacion', 'clientes']) {
    const [title, sub] = t('ph_' + k);
    $(`#view-${k}`).innerHTML = `
      <div class="page-head"><div><h1 class="page-title">${esc(title)}</h1><div class="page-sub">${esc(sub)}</div></div></div>
      <div class="tablewrap"><div class="empty"><svg class="mark"><use href="#i-box"/></svg>
        <div style="font-weight:560;color:var(--ink-2)">${t('phBuilding')}</div>
        <div style="margin-top:4px">${t('phShares')}</div></div></div>`;
  }
}

/* ---- Mobile sidebar ------------------------------------------------------- */
function wireMobile() {
  $('#hamburger').addEventListener('click', () => { $('#sidebar').classList.toggle('open'); $('#scrim-side').classList.toggle('open'); });
  $('#scrim-side').addEventListener('click', closeSidebar);
}
function closeSidebar() { $('#sidebar').classList.remove('open'); $('#scrim-side').classList.remove('open'); }

function debounce(fn, ms) { let tmr; return (...a) => { clearTimeout(tmr); tmr = setTimeout(() => fn(...a), ms); }; }
document.addEventListener('DOMContentLoaded', boot);
