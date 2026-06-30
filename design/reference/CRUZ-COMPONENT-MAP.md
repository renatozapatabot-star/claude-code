# CRUZ — Component Map & Token Reference

Engineering handoff for the CRUZ prototype (`CRUZ.dc.html`, `CRUZ Login.dc.html`, `CRUZ Landing.dc.html`).
This documents what **exists in the prototype today** plus the agreed component names for the production port.
One app, three surfaces (Client Portal · Broker Console · persistent CRUZ AI), five roles, one login.

---

## 1. Design Tokens (extracted from the prototype — do not invent new ones)

### Color — light surfaces (Client Portal + Broker Console)
| Token | Value | Use |
|---|---|---|
| `--bg` | `#F1F4F9` | app canvas |
| `--bg2` | `#EFF3F8` | recessed canvas |
| `--surface` | `#FFFFFF` | cards, drawers |
| `--surface2` | `#EFF3F8` | inset rows, chips |
| `--line` | `#E2E8F0` | hairline borders |
| `--line2` | `#D3DCE7` | stronger borders |
| `--ink` | `#0C1925` | primary text |
| `--ink2` | `#2C4053` | secondary text |
| `--ink3` | `#4C6075` | tertiary text |
| `--muted` | `#64758A` | labels |
| `--muted2` | `#8A99A9` | faint labels |
| `--screen-bg` | `radial-gradient(130% 90% at 50% 0%,#FDFEFF,#EAEFF5 62%)` | screen backdrop |

### Color — dark navy nav rail + dark tables (admin Tráficos / Security)
| Token | Value |
|---|---|
| `--nav-bg` | `#0B1622` |
| `--nav-bg2` | `#0A1018` |
| `--nav-line` | `#182230` |
| `--nav-muted` | `#7d8ea0` |
| `--nav-hover` | `rgba(255,255,255,.06)` |

### Accent (semantic only — never decorative)
| Token | Value | Meaning |
|---|---|---|
| `#22D3EE` | cyan | primary action / active nav / AI |
| `--cyan-ink` `#0E7490` | cyan (AA text) | action text on light |
| `--green-ink` `#047857` / `#34D399` | emerald | cleared / good / LIVE |
| `--amber-ink` `#B45309` / `#F59E0B` | amber | needs-you / STAGED |
| `--crimson-ink` `#BE123C` / `#F43F5E` | crimson | risk / hold / kill-switch |

### Elevation
| Token | Value |
|---|---|
| `--shadow` | `0 1px 2px rgba(20,40,70,.04), 0 8px 24px rgba(20,40,70,.07)` |
| `--shadow-lg` | `0 2px 4px rgba(20,40,70,.05), 0 24px 60px rgba(20,40,70,.13)` |
| `--glass` | `rgba(248,250,252,.82)` + `backdrop-filter: blur` |

### Type
- **Display / UI:** `Inter Tight` (400–900), `font-feature-settings:'cv02','cv03','cv04','ss01'`.
- **Numeric / code:** `JetBrains Mono`, always `font-variant-numeric: tabular-nums`.
- Scale (px): 30/22/19/15/13/11/9.5 — headers, section, card-title, body, label, micro, eyebrow.

### Motion (target tokens for the port)
| Token | Value | Use |
|---|---|---|
| `--mo-fast` | `150ms` | hover / tap / press |
| `--mo-panel` | `250ms` | drawers, accordions, pill↔drawer |
| `--mo-page` | `400ms` | view transitions, shared-element morph |
| `--mo-ease` | `cubic-bezier(0.22,1,0.36,1)` | all of the above |
| keyframes in prototype | `riseIn`, `cruzPulse`, `sheen`, `floatY`, `riseStagger` | entrance / breathing / shimmer |
| guard | `@media (prefers-reduced-motion: reduce)` collapses durations | accessibility |

---

## 2. Shell & Chrome
| Component | In prototype | Notes |
|---|---|---|
| `CruzShell` | fixed grid `rail / main`, `.cz-shell` | hosts rail + header + view + persistent copilot |
| `CruzSidebar` | `nav.cz-rail` | dark-navy, icon rail, 15 destinations, role-filtered, tooltip + aria-label per item, active = cyan |
| `CruzTopBar` | `header` | wordmark, ClientSwitcher, language toggle (ES/EN), Simulate, notifications, profile |
| `ClientSwitcher` | `toggleClientMenu` / `clientMenuOpen` | broker-only (`clientSwitcherD`); re-scopes whole console + copilot; EVCO/Acme/Toluca/Nordic/Sigma |
| `LangToggle` | `setEn` / `setEs` | persists `localStorage cruz.lang`; ES default |

---

## 3. Role Homes (one login → role home via `localStorage cruz.role`)
| Component | Role | In prototype |
|---|---|---|
| `RoleHomeCliente` | Cliente | calm Resumen — KPIs, "¿Qué necesita de ti ahora?" |
| `RoleHomeOperador` | Operador | `resumenOps` — decision queue + Operations Pulse + Alertas dominant |
| `RoleHomeContabilidad` | Contabilidad | `resumenFin` — A/R, honorarios MTD, overdue |
| `RoleHomeBodega` | WMS/Bodega | `resumenDock` — today's dock, scan CTA, dwell |
| `RoleHomeAdmin` | Admin/Broker | Command + Cartera + full console |
| `RoleRouter` | — | login routes by email identity → role home |

---

## 4. Decision / Agentic Core
| Component | In prototype | Notes |
|---|---|---|
| `DecisionCard` | resumen decision queue | title · summary · confidence% · GO · Dismiss |
| `GoGate` | `advanceGo` + `cb_ready` card | "Aprobar y avanzar"; never auto-files/pays/emails |
| `UndoBar` | `toast` + 5.2s timer | "Deshacer · 5s" shrinking bar; restores card |
| `OperationPulse` | command center pulse | live number ticks |
| `AlertasRow` | alertas queue | deadline-sorted; urgent = crimson left border |
| `ShadowBadge` | **partial — see gaps** | broker-only "Modo sombra" dashed border on not-yet-live proposals |
| `LiveStagedBadge` | `dataSources` LIVE/STAGED | green=live, gray=staged; honest, never fake |
| `HonestEmpty` | MVE "pendiente de sincronización" | empty ≠ zero; missing ≠ error |
| `SkeletonCard` | **gap — see below** | shimmer loading state |

---

## 5. Persistent CRUZ Copilot (mounted on every app screen)
| Component | In prototype | Notes |
|---|---|---|
| `CopilotPill` | collapsed bottom-right | breathing orb + live status line |
| `CopilotDrawer` | `copilotExpanded` 420px | full-screen sheet on mobile |
| `CopilotContextBar` | `pageHelp.label` | current screen + client + entity |
| `CopilotNow` | `pageHelp.see` | one sentence: what CRUZ sees here |
| `CopilotProposals` | `pageHelp.actions` | ≤3 cards, each → `agentRespond(intent,reply,{go,log,toast})` |
| `CopilotAsk` | `sendAsk` + contextual chips | real `window.claude.complete`, typewriter reveal; chips change per screen |
| `CopilotActivity` | `ledger` | last agent actions + timestamps |
| `ModeBadge` | `coModeBadge/Sub` | **honest:** SUPERVISED / CO-PILOT / PAUSED (autonomous mode removed) |
| `AgentCrewPanel` | `crew` (6 chips) | Clasificador · Valoración · Cumplimiento · Tráfico · Tesorería · Comunicación; active chip tracks step |
| `AssistanceLevel` | `autoOpts` | Supervised / Co-pilot segmented (+ Pause) — was "Autonomy line" |

---

## 6. Screens
| Component | In prototype | Surface |
|---|---|---|
| `CommandCenter` | live border map, pulse, AI feed | Broker |
| `CarteraClientes` | `ClientHealthCard` grid | Broker |
| `ClientHealthCard` | name · RFC · MVE% · alertas · tráficos30d · semáforo · valor | Broker |
| `TraficosTable` | dark navy master list, 543 rows | Both |
| `DigitalTwin` | `twin` view, 6 `TwinStep` | Both |
| `TwinStep` | step + check/pulse; duty math IGI/DTA/IVA | — |
| `ClassifyWorkspace` | recommend / override / reasoning / citations | Broker |
| `PedimentoWorkspace` | header, duties, validations, audit | Broker |
| `Expedientes` / `DocumentHub` | COVE · pedimento · Carta Porte · DODA · B/L · 7525-V | Both |
| `Facturacion` | broker A/R + e.conta/QuickBooks LIVE/STAGED | Broker |
| `MisFacturas` | client read-only honorarios + PDF | Client |
| `Alertas` | GO queue | Broker/Operador |
| `Glosa` | post-clearance defense files | Broker |
| `InventoryWMS` · `Anexo24` · `EntradaBodega` · `ReporteMensual` · `MVEVerificacion` · `Buscar` | warehouse + compliance + search | Both |
| `SettingsAutonomia` | per-workflow SHADOW/LIVE/OFF + kill-switch | Admin |
| `WhiteLabel` · `Security` · `Reports` | console admin | Broker |
| `StressHarness` | 10-scenario adversarial demo | Broker/demo |
| `MobileField` | one-thumb field view + ambient agent strip | — |

---

## 7. Login & Landing
| Component | In prototype |
|---|---|
| `LoginSplit` | dark brand panel + light form |
| `LivingGlobe` | canvas: day/night Lambert terminator, specular, fresnel rim, starfield, comet corridor arcs, pulsing crossing rings |
| `SSOButtons` · `AuthField` (focus-glow) · `SignInButton` (hover-lift) | form micro-interactions |
| `CompanionDemo` | scripted agent-run loop (chips, steps, gate) |
| Landing: `HeroGlobe` · `AgentStory` · `FeatureGrid` · `WhiteLabelBlock` · `ROICalculator` · `CTA` | marketing |

---

## 8. Honest-data rules (enforced in prototype)
- No fabricated numbers. Unsynced fields render `—` or **"pendiente de sincronización."**
- Integrations show **LIVE** (green) or **STAGED** (gray) — never fake "connected."
- Agent **proposes → human GOes → 5s undo → logged.** Never auto: file pedimento, pay duties, email client/supplier.
- Empty ≠ zero. Missing ≠ error.

---

## 9. Known gaps to reach 100/100 (prioritized — not yet in prototype)
1. **Copilot state machine** — explicit Idle/Watching/Working/Proposed/AwaitingSignature/Shadow with animated 200ms cross-fade on navigation (today it's status-string + crew, not a formal state machine).
2. **ShadowBadge** end-to-end on proposal cards (broker-only) with dashed border.
3. **Shared-element morph** row → Twin (today it's a view swap).
4. **KPI count-up + skeleton shimmer + error/retry** as universal per-screen states.
5. **Keyboard-velocity layer** (`j/k`, `G`=GO, `/`=search, number tabs) beyond ⌘K.
6. **Mobile** card-ization of tráficos + full-screen copilot sheet + 60px GO targets.
