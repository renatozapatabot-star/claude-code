// The real second-brain query layer — [P8-W2-01], canon-flagged as the one piece of the Second
// Brain pillar left "POR ACTIVAR": SECOND-BRAIN.md says the vault "is not yet indexed for query,"
// and `brain-access.mjs`'s own header comment says as much ("this module never queries, ingests, or
// mutates the real `aguila-brain` vault — that's [P8-W2-01], still POR ACTIVAR"). This file is that
// piece: it turns real vault markdown into the `BrainDoc[]` shape `answerFromBrain` already expects,
// and ranks them against a query. It does not replace `brain-access.mjs`'s access law — every result
// this module produces still has to pass through `resolveBrainAccess`/`answerFromBrain` before a user
// ever sees it; this file only answers "what matched," never "who's allowed to see it."
//
// Ground truth this module is built against (read, not assumed): the real `aguila-brain` vault at
// /workspace/aguila-brain (read-only external repo — this module only ever calls `fs.readFileSync`/
// `readdirSync` on it, never a write, matching SECOND-BRAIN.md's "never mutated by readers" and this
// repo's law against writing outside `claude-code`). As of this session the vault holds exactly 7 real
// content notes (`01-AGUILA/00-Overview.md` + one Overview.md each under 00-FREIGHT/01-Adjunto/02-CRUZ/
// 03-Clients, `04-Canon/Entity-Boundary.md`, `05-Daily/2026-07-19.md`) plus the untouched Obsidian
// default `Welcome.md`, which is boilerplate, not knowledge, and is deliberately excluded below.
//
// The one non-obvious ground-truth fact this module encodes: `01-AGUILA/00-Overview.md` states in
// plain prose "Clients: never — this vault is internal only." No note in the real vault is
// tenant-scoped content today (03-Clients/Overview.md is a *mixed*-tenant roster naming all four
// clients in one file — handing it to any one client's tenant scope would leak the other three's
// names). So every doc this module builds from *today's* real vault is `category`-scoped for
// employees or `principalOnly`, never `tenant`-scoped — that is what the real content actually
// supports, not an arbitrary restriction. The categorizer below is still written to recognize a
// per-tenant path shape (`03-Clients/<Tenant>/...`) so it keeps working the day the vault grows real
// per-client notes, without needing to change when that day comes.

const EXCLUDED_BASENAMES = new Set(['Welcome.md']);

// tiny stopword set — this corpus is a handful of notes, not a search-engine-scale document set;
// the goal is only to stop 1-2-letter connector words from drowning out real content-word matches.
const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'is', 'it', 'on', 'for', 'as', 'by', 'this',
  'that', 'with', 'be', 'are', 'was', 'were', 'at', 'from', 'never', 'not', 'no',
]);

/**
 * Folder-to-category law for the real vault layout (`01-AGUILA/<NN-Name>/...`). Deterministic and
 * path-derived — never guessed from content — so re-running it against the same real files always
 * produces the same categorization. Returns `null` for a path this module deliberately does not
 * index (Obsidian boilerplate, dotfiles, non-markdown).
 *
 * @param {string} relPath - vault-relative path, forward-slash separated (e.g. '01-AGUILA/04-Canon/Entity-Boundary.md')
 * @returns {{ category: string, tenant?: string, principalOnly?: boolean } | null}
 */
export function categoryForPath(relPath) {
  if (typeof relPath !== 'string' || relPath.length === 0) return null;
  const norm = relPath.replace(/\\/g, '/').replace(/^\.\/?/, '');
  const basename = norm.split('/').pop();
  if (!norm.endsWith('.md')) return null;
  if (EXCLUDED_BASENAMES.has(basename)) return null;
  if (norm.startsWith('.obsidian/') || norm.startsWith('.git/')) return null;

  const parts = norm.split('/').filter(Boolean);
  // strip a leading vault-root folder name if present (e.g. '01-AGUILA/...'); the real vault nests
  // everything one level under `01-AGUILA/`, but this function is also exercised in tests against
  // bare `00-FREIGHT/...`-style paths, so it tolerates either.
  const rest = parts[0] === '01-AGUILA' ? parts.slice(1) : parts;

  if (rest.length === 1) {
    // top-level vault note (00-Overview.md) — the vault's own nav/access-law doc; foundational,
    // same trust tier as the Canon folder rather than day-to-day ops content.
    return { category: 'canon' };
  }

  const folder = rest[0];
  if (/^00-FREIGHT$/i.test(folder)) return { category: 'ops' };
  if (/^01-Adjunto$/i.test(folder)) return { category: 'ops' };
  // CRUZ is the licensed customs-clearance portal — "a licensed human owns the final customs act"
  // (per the real note itself) puts this in the broker function, not generic ops.
  if (/^02-CRUZ$/i.test(folder)) return { category: 'broker' };
  if (/^03-Clients$/i.test(folder)) {
    if (rest.length >= 3) {
      // future per-tenant shape: 03-Clients/<Tenant>/whatever.md — genuinely tenant-owned content.
      return { category: 'client-doc', tenant: rest[1] };
    }
    // today's real shape: a single flat Overview.md naming every client in one file — mixed-tenant,
    // so it can only ever be an employee (ops) doc, never handed to any one tenant's scope.
    return { category: 'ops' };
  }
  if (/^04-Canon$/i.test(folder)) return { category: 'canon' };
  if (/^05-Daily$/i.test(folder)) {
    // working-session logs name binding founder rulings, WO numbers, and Money-Employment figures —
    // treated as principal-tier, matching brain-access.mjs's principalOnly gate rather than any
    // single employee role.
    return { category: 'daily', principalOnly: true };
  }
  return null;
}

/**
 * Minimal, deliberately non-general frontmatter parser for this vault's own simple style — flat
 * `key: value` and `key: [a, b, c]` lines between a leading and closing `---`. Not a YAML parser
 * (zero-dep law; this repo's convention is a hand-rolled helper sized to the real input, same as
 * `normalize.mjs`), and it is not expected to survive nested YAML — the real vault notes checked
 * against it (see module header) never use anything beyond this shape.
 *
 * @param {string} rawContent
 * @returns {{ frontmatter: Record<string, string|string[]>, body: string }}
 */
export function parseVaultNote(rawContent) {
  if (typeof rawContent !== 'string') throw new TypeError('parseVaultNote: rawContent must be a string');
  const lines = rawContent.split('\n');
  if (lines[0] !== '---') return { frontmatter: {}, body: rawContent };

  const closeIdx = lines.indexOf('---', 1);
  if (closeIdx === -1) return { frontmatter: {}, body: rawContent };

  const frontmatter = {};
  for (const line of lines.slice(1, closeIdx)) {
    const m = /^(\w[\w-]*):\s*(.*)$/.exec(line);
    if (!m) continue;
    const [, key, rawValue] = m;
    const trimmed = rawValue.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      frontmatter[key] = trimmed
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    } else {
      frontmatter[key] = trimmed;
    }
  }
  const body = lines.slice(closeIdx + 1).join('\n').trim();
  return { frontmatter, body };
}

/**
 * @typedef {import('./brain-access.mjs').BrainDoc} BrainDoc
 */

/**
 * Builds one `BrainDoc` (the exact shape `resolveBrainAccess`/`answerFromBrain` consume) from one
 * real vault file's path + raw content. Returns `null` for a path `categoryForPath` excludes.
 * `snippet` here is the note's own lead paragraph (post-frontmatter, first non-empty line) — the
 * per-query snippet used at answer time is computed separately by `searchBrainIndex`, since the
 * useful excerpt depends on what was actually searched for.
 *
 * @param {string} relPath
 * @param {string} rawContent
 * @returns {(BrainDoc & { body: string, tokens: string[] }) | null}
 */
export function buildBrainDoc(relPath, rawContent) {
  const classification = categoryForPath(relPath);
  if (!classification) return null;
  if (typeof rawContent !== 'string') throw new TypeError('buildBrainDoc: rawContent must be a string');

  const { body } = parseVaultNote(rawContent);
  const leadLine = body.split('\n').map((l) => l.trim()).find((l) => l.length > 0 && !l.startsWith('#')) ?? '';
  const tokens = tokenize(body);

  return {
    id: relPath,
    category: classification.category,
    ...(classification.tenant ? { tenant: classification.tenant } : {}),
    ...(classification.principalOnly ? { principalOnly: true } : {}),
    snippet: leadLine.length > 200 ? `${leadLine.slice(0, 197)}...` : leadLine,
    body,
    tokens,
  };
}

/**
 * @param {string} text
 * @returns {string[]} lowercase alphanumeric tokens, length >= 2, stopwords removed
 */
export function tokenize(text) {
  const raw = String(text ?? '').toLowerCase().match(/[a-z0-9]+/g) ?? [];
  return raw.filter((t) => t.length >= 2 && !STOPWORDS.has(t));
}

/**
 * @typedef {Object} BrainSearchIndex
 * @property {Map<string, BrainDoc & { body: string, tokens: string[] }>} docsById
 * @property {Map<string, Map<string, number>>} postings - token -> (docId -> term frequency)
 * @property {Map<string, number>} docLength - docId -> token count
 * @property {number} avgDocLength
 */

/**
 * Builds an in-memory inverted index over already-loaded `BrainDoc`s (each carrying `body`/`tokens`
 * from `buildBrainDoc`). Pure — no I/O; the caller supplies the docs (same convention as
 * `system-adapters.mjs` consuming already-fetched external shapes rather than fetching itself).
 *
 * @param {(BrainDoc & { body: string, tokens: string[] })[]} docs
 * @returns {BrainSearchIndex}
 */
export function buildBrainIndex(docs) {
  if (!Array.isArray(docs)) throw new TypeError('buildBrainIndex: docs must be an array');

  const docsById = new Map();
  const postings = new Map();
  const docLength = new Map();
  let totalLength = 0;

  for (const doc of docs) {
    if (!doc || typeof doc.id !== 'string' || !Array.isArray(doc.tokens)) {
      throw new TypeError('buildBrainIndex: each doc needs a string id and a tokens array (use buildBrainDoc)');
    }
    docsById.set(doc.id, doc);
    docLength.set(doc.id, doc.tokens.length);
    totalLength += doc.tokens.length;

    const seen = new Map();
    for (const tok of doc.tokens) seen.set(tok, (seen.get(tok) ?? 0) + 1);
    for (const [tok, freq] of seen) {
      if (!postings.has(tok)) postings.set(tok, new Map());
      postings.get(tok).set(doc.id, freq);
    }
  }

  return {
    docsById,
    postings,
    docLength,
    avgDocLength: docs.length > 0 ? totalLength / docs.length : 0,
  };
}

function buildSnippet(body, queryTokens) {
  const lower = body.toLowerCase();
  let hitPos = -1;
  for (const tok of queryTokens) {
    const pos = lower.indexOf(tok);
    if (pos !== -1 && (hitPos === -1 || pos < hitPos)) hitPos = pos;
  }
  if (hitPos === -1) {
    const lead = body.split('\n').map((l) => l.trim()).find((l) => l.length > 0) ?? '';
    return lead.length > 160 ? `${lead.slice(0, 157)}...` : lead;
  }
  const start = Math.max(0, hitPos - 60);
  const end = Math.min(body.length, hitPos + 100);
  const prefix = start > 0 ? '...' : '';
  const suffix = end < body.length ? '...' : '';
  return `${prefix}${body.slice(start, end).replace(/\s+/g, ' ').trim()}${suffix}`;
}

/**
 * Ranks indexed docs against a query using a small BM25-style score (log-IDF * saturating TF) —
 * appropriate for a corpus this small (single digits to low hundreds of notes), not a claim this
 * scales to a search-engine-sized vault. Returns `BrainDoc`s ready to hand straight to
 * `answerFromBrain(query, matchedDocs, user)` — access filtering happens there, not here; this
 * function returns relevance matches only, blind to who's asking.
 *
 * A query with zero token overlap with any doc returns `[]` rather than every doc in the corpus —
 * matching the honesty law (`answerFromBrain` turns an empty match list into "not in the brain yet"
 * rather than this function ever padding results with irrelevant docs to have something to show).
 *
 * @param {BrainSearchIndex} index
 * @param {string} query
 * @param {{ topK?: number }} [options]
 * @returns {BrainDoc[]} each with a query-specific `snippet`, ranked best-first
 */
export function searchBrainIndex(index, query, options = {}) {
  if (!index || !(index.docsById instanceof Map)) {
    throw new TypeError('searchBrainIndex: index must come from buildBrainIndex');
  }
  if (typeof query !== 'string' || query.length === 0) {
    throw new TypeError('searchBrainIndex: query must be a non-empty string');
  }
  const topK = Number.isFinite(options.topK) && options.topK > 0 ? Math.floor(options.topK) : 5;

  const queryTokens = [...new Set(tokenize(query))];
  if (queryTokens.length === 0) return [];

  const N = index.docsById.size;
  const k1 = 1.5;
  const b = 0.75;
  const scores = new Map();

  for (const tok of queryTokens) {
    const posting = index.postings.get(tok);
    if (!posting) continue;
    const df = posting.size;
    const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
    for (const [docId, tf] of posting) {
      const dl = index.docLength.get(docId) ?? 0;
      const denom = tf + k1 * (1 - b + b * (dl / (index.avgDocLength || 1)));
      const termScore = idf * ((tf * (k1 + 1)) / (denom || 1));
      scores.set(docId, (scores.get(docId) ?? 0) + termScore);
    }
  }

  return [...scores.entries()]
    .filter(([, score]) => score > 0)
    .sort((a, b2) => b2[1] - a[1])
    .slice(0, topK)
    .map(([docId, score]) => {
      const doc = index.docsById.get(docId);
      const { body, tokens, ...brainDoc } = doc;
      return { ...brainDoc, snippet: buildSnippet(body, queryTokens), score };
    });
}

/**
 * The one I/O boundary in this module: reads real markdown files off disk from a vault directory.
 * Never writes — this repo's hard law forbids writing to `/workspace/*` (external, read-only
 * repos), and SECOND-BRAIN.md itself requires the vault is "never mutated by readers." Uses only
 * `fs.readdirSync`/`readFileSync`, both read-only syscalls.
 *
 * @param {string} vaultDir - absolute path to the vault root (e.g. '/workspace/aguila-brain')
 * @returns {Promise<(BrainDoc & { body: string, tokens: string[] })[]>}
 */
export async function loadVaultDocs(vaultDir) {
  if (typeof vaultDir !== 'string' || vaultDir.length === 0) {
    throw new TypeError('loadVaultDocs: vaultDir must be a non-empty string');
  }
  const fs = await import('node:fs/promises');
  const path = await import('node:path');

  const docs = [];
  async function walk(dir, relPrefix) {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return; // vault not present in this environment — caller sees an empty result, not a crash
    }
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue; // .git, .obsidian — never indexed
      const relPath = relPrefix ? `${relPrefix}/${entry.name}` : entry.name;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath, relPath);
      } else if (entry.isFile() && relPath.endsWith('.md')) {
        const raw = await fs.readFile(fullPath, 'utf8');
        const doc = buildBrainDoc(relPath, raw);
        if (doc) docs.push(doc);
      }
    }
  }
  await walk(vaultDir, '');
  return docs;
}
