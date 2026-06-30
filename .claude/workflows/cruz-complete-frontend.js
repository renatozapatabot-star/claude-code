export const meta = {
  name: 'cruz-complete-frontend',
  description: 'Mine real CRUZ.dc.html package for 4 remaining surfaces; return implementation-ready specs in the white+red canon',
  phases: [{ title: 'Investigar', detail: 'one Explore agent per surface' }],
}

const TOKENS = `
CRUZ white+red canon (DESIGN.md). Use ONLY these tokens/classes; do NOT invent a new design language.
Color: --cruz #cf3a22 (brand/primary/gate), --paper #faf8f5, --surface #fff, --ink #1a1c20, --ink-2/-3/-4 (text), --line hairline.
Semáforo/status: --ok green (verde/LIVE), --warn amber (amarillo/STAGED/needs-you), --alert red (rojo/hold), --info blue (transito).
Type: system sans; mono (.mono / --mono) with tabular-nums for ALL codes, pedimentos, money, confidence.
Existing reusable components (already in public/styles.css): .tablewrap + table (dense data table), .pill (status), .sem.ok/.warn/.alert (semaforo dot+label), .kv grid (key/value detail), .stat (KPI card), .drawer (right detail panel), .section-h, .empty (honest empty state), .seg (segmented filter), .badge-feed.live/.staged.
JS conventions (public/app.js): render<Surface>() builds innerHTML of #view-<name>; helpers $ $$ esc() fmtUsd(); bilingual via t('key') reading DICT[LANG]; rows open detail via openDrawer-style pattern. Spanish UI, English code.
Honest data rules: DATOS DEMO; never fabricate; empty = "Pendiente de sincronización"; feeds EN VIVO / POR ACTIVAR.
`

const SPEC_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['surface', 'copyEs', 'kpis', 'table', 'detail', 'emptyState', 'reuse', 'newCss', 'cohesionNotes'],
  properties: {
    surface: { type: 'string' },
    copyEs: { type: 'object', additionalProperties: false, required: ['title', 'sub'], properties: { title: { type: 'string' }, sub: { type: 'string' } } },
    kpis: { type: 'array', maxItems: 4, items: { type: 'object', additionalProperties: false, required: ['label', 'value', 'note', 'tone'], properties: { label: { type: 'string' }, value: { type: 'string' }, note: { type: 'string' }, tone: { type: 'string', enum: ['neutral', 'ok', 'warn', 'alert', 'info', 'cruz'] } } } },
    table: { type: 'object', additionalProperties: false, required: ['columns', 'rowFields', 'note'], properties: { columns: { type: 'array', items: { type: 'string' } }, rowFields: { type: 'array', items: { type: 'string' } }, note: { type: 'string' } } },
    detail: { type: 'object', additionalProperties: false, required: ['title', 'sections'], properties: { title: { type: 'string' }, sections: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['heading', 'rows'], properties: { heading: { type: 'string' }, rows: { type: 'array', items: { type: 'string' } } } } } } },
    emptyState: { type: 'string' },
    mobileNotes: { type: 'string' },
    reuse: { type: 'array', items: { type: 'string' } },
    newCss: { type: 'array', items: { type: 'string' } },
    cohesionNotes: { type: 'string' },
    dataFields: { type: 'array', items: { type: 'string' } },
  },
}

const SURFACES = [
  { key: 'pedimentos', ref: 'design/reference/CRUZ.dc.html', dict: 'p_entryHeader,p_duties,p_validation,p_audit,p_transmit,ac_duty,ac_iva', focus: 'Pedimento clearance workspace: list of entries (clearance pipeline) + a detail with entry header, duties (IGI/DTA/IVA), 14/14 SAT validations, audit trail, and "Firmar y transmitir al SAT" reusing the existing signature gate. Data already exists in data/pedimentos.js — read it and match its fields exactly.' },
  { key: 'expedientes', ref: 'design/reference/CRUZ Cleared Doc.dc.html', dict: 'dh_title,dh_sub,ec_entrada,ec_desc,ec_llegada,ec_bultos,ec_peso', focus: 'Document Hub / Expedientes: every trade document (COVE, pedimento, Carta Porte, DODA, B/L, 7525-V) read/generated/validated/e-stamped/transmitted, linked per embarque. Per-doc status pill + validated badge.' },
  { key: 'facturacion', ref: 'design/reference/CRUZ Broker Console.dc.html', dict: 'fa_title,fa_sub,fa_honorarios,fa_disbursed,fa_collected,fa_overdue,fa_invoice,fa_client,fa_amount,fa_econtaSub,fa_synced,fa_connect', focus: 'Facturación: honorarios MTD, desembolsos, cobranza por cliente, vencidos; invoice table; e.conta LIVE / QuickBooks STAGED feed badges (honest data).' },
  { key: 'clientes', ref: 'design/reference/CRUZ Broker Console.dc.html', dict: 'cl_title,cl_sub,cl_clients,cl_activeShip,cl_exposure,cl_alerts,cl_client,cl_active,cl_padron,cl_risk', focus: 'Clientes / Cartera: book of business — ClientHealthCard grid OR dense table with name, RFC, MVE%, alertas, tráficos30d, semáforo, valor. Every importer on one patente. Keep dense+calm, not marketing cards.' },
]

phase('Investigar')
const specs = await parallel(SURFACES.map((s) => () =>
  agent(
    `You are designing the "${s.key}" surface for CRUZ, an existing cross-border (US-MX) customs operating system, to a 100/100 bar.\n\n${TOKENS}\n\nRead these for ground truth (do NOT invent — extract real CRUZ substance and map it to the white+red canon):\n- DESIGN.md (the canon)\n- ${s.ref} (real prototype for this surface)\n- design/reference/CRUZ-COMPONENT-MAP.md (component + token reference)\n- public/styles.css and public/app.js (the exact conventions/classes you must reuse)\n- For pedimentos also read data/pedimentos.js and match its field names.\n\nReal Spanish copy keys to honor (search the DICT in design/reference/CRUZ.dc.html for these and use the ES strings verbatim where they fit): ${s.dict}\n\nSurface intent: ${s.focus}\n\nReturn an implementation-ready spec: ES title/sub copy, up to 4 KPI stat cards (label/value/note/tone), the primary dense table (columns + the row field names), the detail/drawer (heading + key:value rows per section), the honest empty state copy, which EXISTING css classes to reuse, the minimal NEW css blocks genuinely needed (describe, don't write full CSS), mobile 375px notes, and cohesion notes (how it stays one product with the rest of CRUZ). Prefer reuse over new CSS. Be concrete and faithful to the real CRUZ surface.`,
    { label: `spec:${s.key}`, phase: 'Investigar', agentType: 'Explore', schema: SPEC_SCHEMA }
  )
))

return { specs: specs.filter(Boolean) }
