# THE SECOND BRAIN — `aguila-brain` under FREIGHT

<!-- BRAIN-SPEC v1 owner=P8-W1-01 wo=WO-14 -->

The founder's directive: *"everything within the computer / the second brain lives under FREIGHT,"*
surfaced on the fly — to the founder, his father, employees, and clients — via the Deck and
@supertitobot. The knowledge base is the real repo `renatozapatabot-star/aguila-brain` (águila =
eagle). This spec makes it a FREIGHT surface, honestly: nothing is fabricated, nothing crosses a user
class it shouldn't (§0.4-8 + the G7 tenant law).

## What it holds

Notes, documents, prior work, decisions, contacts, and the accumulated context of the enterprise —
everything ever done in the Throne studio. Ingested and indexed; never mutated by readers.

**State as of 2026-07-19 (verified, not claimed):** the vault was an empty default Obsidian
install (welcome note only) until this session. It is now seeded with real structure — `01-AGUILA/`
with `00-FREIGHT`, `01-Adjunto`, `02-CRUZ`, `03-Clients`, `04-Canon`, `05-Daily` — populated from
ground truth pulled out of `freightos-control-plane`'s `canon/HANDOFF-MASTER.md` (the entity
boundary law, Money Employment state, PLAIOS state). Committed + pushed to `aguila-brain@master`.
This is real content the founder can open in Obsidian today; it is not yet indexed for query (below).

## Ingestion + index

- Source: `aguila-brain` (now seeded — see above; + over time, Gmail threads, Drive/files, call
  transcripts via `whisper-transcriber`) — ingest, chunk, embed/index into a searchable store.
- The index is **read-only to surfaces**; writes happen only through the sanctioned ingest path.
- Honest liveness: **POR ACTIVAR** — the vault has real content now, but the *query/index* layer
  ([P8-W2-01]) that lets the Deck/bot search it is not yet built.

## The access matrix (who sees what)

| User class | Scope |
|---|---|
| **Founder (Renato Zapata IV)** | full — everything |
| **Father / co-principal (Renato Zapata III)** | full — everything |
| **Employees** (broker, ops/Ursula Banda, warehouse, accounting, dispatch) | **role-scoped** — only what their role needs; no cross-role, no principal-only material |
| **Clients** (EVCO, Duratech, Milacron, Foam Supplies) | **tenant-scoped** — only their own shipments/docs; never another tenant's, never internal notes |

Enforcement is the same tenant + role law as CRUZ (v1.4 G7): the server derives scope from the
authenticated identity; a payload can never widen it.

## The surfacing rail

- **Deck panel** (Monitor 2): "ask the brain" — a scoped query box returning cited answers.
- **@supertitobot**: `/brain <question>` returns a scoped, cited answer on the phone (role/tenant
  enforced before the answer, oracle-free — the P2 sender-registry + tenant gate).
- Every answer **cites its source** (which brain document); no source → "not in the brain yet," never a
  fabricated answer (§0.4-1).
