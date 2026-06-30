export const meta = {
  name: 'cruz-100-critic',
  description: 'Adversarial 100/100 design review of CRUZ across 4 lenses; return concrete confidence-rated fixes',
  phases: [{ title: 'Crítica', detail: '4 lenses in parallel' }],
}

const FINDINGS_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['findings'],
  properties: {
    findings: {
      type: 'array', maxItems: 8,
      items: {
        type: 'object', additionalProperties: false,
        required: ['title', 'file', 'lens', 'severity', 'confidence', 'autoFixSafe', 'fix', 'rationale'],
        properties: {
          title: { type: 'string' },
          file: { type: 'string' },
          lens: { type: 'string' },
          severity: { type: 'string', enum: ['low', 'medium', 'high'] },
          confidence: { type: 'number' },
          autoFixSafe: { type: 'boolean' },
          fix: { type: 'string' },
          rationale: { type: 'string' },
        },
      },
    },
  },
}

const COMMON = `
CRUZ is a cross-border customs operating system, white+red canon (read DESIGN.md). Files live under public/ (index.html, styles.css, app.js, login.html, globe.js), data/, server.js. It is verified clean (0 console errors, 0 overflow @375). Your job: find concrete, real, HIGH-BAR improvements toward 100/100 — not vague praise, not speculative rewrites. Every finding must name a file, a concrete fix, a confidence 0..1, and whether the fix is SAFE to auto-apply (small, local, no behavior risk). Prefer fewer, stronger findings. Do NOT propose a new design language, generic cards, gradients, or marketing filler. Honor: Spanish UI/English code, the trust loop, honest data (DATOS DEMO / EN VIVO / POR ACTIVAR), tokens only from DESIGN.md.
`

const LENSES = [
  { key: 'canon', focus: 'Cohesion & canon adherence: scan public/styles.css and public/app.js + public/index.html for any color/spacing/type that drifts from DESIGN.md tokens, inconsistent component usage, magic numbers that should be tokens, or surfaces that look subtly different from each other. Also public/login.html consistency.' },
  { key: 'a11y', focus: 'Accessibility & semantics: public/index.html + public/login.html + styles.css. Missing aria-labels/roles, focus-visible states, color-contrast risks (esp. --ink-3/-4 on paper, pill text), keyboard traps in drawers/gate/copilot, button vs div, alt text, reduced-motion gaps. Concrete element-level fixes.' },
  { key: 'clarity', focus: 'Clarity, density & honest-data: public/app.js (the DICT + renders). Spanish copy correctness/naturalness, hierarchy, scannability, any place that could fabricate data instead of showing — / Pendiente de sincronización, empty/loading/error states missing, number formatting (tabular-nums, MXN/USD).' },
  { key: 'robust', focus: 'Robustness & correctness: public/app.js + server.js + data/*.js. Any rendering/JS bug, unescaped user/content (esc() usage / XSS), broken i18n keys (t() referencing a missing key), event-listener leaks, mobile overflow risk, API edge cases. Real defects only, with the exact fix.' },
]

phase('Crítica')
const results = await parallel(LENSES.map((l) => () =>
  agent(
    `${COMMON}\nLens: ${l.key}.\n${l.focus}\n\nRead DESIGN.md first, then the named files. Return up to 8 concrete findings for THIS lens only, ranked by (severity x confidence). For each: exact file, concrete fix (what to change), confidence, and autoFixSafe.`,
    { label: `critic:${l.key}`, phase: 'Crítica', agentType: 'Explore', schema: FINDINGS_SCHEMA }
  )
))

const all = results.filter(Boolean).flatMap((r) => r.findings || [])
const safe = all.filter((f) => f.autoFixSafe && f.confidence >= 0.7).sort((a, b) => b.confidence - a.confidence)
return { total: all.length, safeHighConfidence: safe, all }
