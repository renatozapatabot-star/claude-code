// WO-register table parser — turns the founder-ask table that already lives in prose
// (PROJECT-STATUS.md §3 / FREIGHT-OS-CANON.md's WO items) into structured data a composition
// module can rank and cite. Pure text-in/data-out: this file never reads a file itself and never
// invents a WO that isn't literally a row in the text it's given — per the repo's "never
// fabricate" law, a row this parser can't confidently classify is kept (with its raw text
// untouched) and flagged `statusBucket: 'unclear'` plus a warning, never silently dropped or
// silently guessed into 'open'/'closed'.
//
// Table shape assumed (the real one, e.g. PROJECT-STATUS.md's "## 3. WO register"):
//   | WO-01 | <ask, may contain emoji/backticks/bold> | <status cell, first **bold** span is the
//   ...      verdict, e.g. "**OPEN**", "**CLOSED**", "**RESOLVED**", "**DONE**"> |

const ROW_RE = /^\|\s*(WO-\d+)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*$/;
const ALARM_EMOJI = '🚨';

/** First `**...**` span in the status cell — the actual verdict is always led with one. */
function firstBoldSpan(text) {
  const m = text.match(/\*\*(.+?)\*\*/);
  return m ? m[1] : text.trim();
}

function bucketFromLabel(label) {
  const up = label.toUpperCase();
  // Order doesn't matter here — the four keywords are mutually exclusive substrings in every real
  // row seen so far — but CLOSED/RESOLVED/DONE are checked before OPEN only for readability, not
  // because any of them collide (e.g. no real status cell has ever said "RE-OPEN").
  if (/\bCLOSED\b/.test(up)) return 'closed';
  if (/\bRESOLVED\b/.test(up)) return 'resolved';
  if (/\bDONE\b/.test(up)) return 'done';
  if (/\bOPEN\b/.test(up)) return 'open';
  return 'unclear'; // e.g. the real WO-10 row: "ARMED BUT NOT PRODUCING OUTPUT" — a real, honest
  // ambiguity the canon itself calls out; this parser must not paper over it with a guess.
}

/**
 * @param {string} markdownText a WO-register markdown table (or any text containing `| WO-NN | ... | ... |`
 *   rows — header/separator/non-matching lines are skipped silently, they aren't warnings).
 * @returns {{ items: { id: string, ask: string, statusRaw: string, statusLabel: string,
 *   statusBucket: 'open'|'closed'|'resolved'|'done'|'unclear', alarmCount: number }[],
 *   warnings: string[] }}
 */
export function parseWoRegisterTable(markdownText) {
  const warnings = [];
  const items = [];
  const seen = new Set();
  const lines = String(markdownText ?? '').split('\n');

  for (const line of lines) {
    const m = ROW_RE.exec(line);
    if (!m) continue;
    const [, id, ask, statusCell] = m;
    if (seen.has(id)) { warnings.push(`duplicate row for ${id} — kept the first, ignored the repeat`); continue; }
    seen.add(id);
    const statusLabel = firstBoldSpan(statusCell);
    const statusBucket = bucketFromLabel(statusLabel);
    const alarmCount = (ask.match(new RegExp(ALARM_EMOJI, 'g')) ?? []).length;
    if (statusBucket === 'unclear') warnings.push(`${id}: status cell has no OPEN/CLOSED/RESOLVED/DONE verdict — kept as 'unclear', not guessed`);
    items.push({ id, ask, statusRaw: statusCell, statusLabel, statusBucket, alarmCount });
  }

  if (items.length === 0 && /WO-\d+/.test(markdownText ?? '')) {
    // The text clearly mentions WO ids but nothing matched the row shape — likely the table
    // format changed. Silence here would be a fabrication-by-omission risk (a founder-brief
    // caller would see an empty, "all clear" WO section that's actually a broken parser).
    warnings.push('input mentions WO-NN ids but no row matched the expected "| WO-NN | ask | status |" shape — table format may have changed, check parseWoRegisterTable\'s ROW_RE');
  }

  return { items, warnings };
}
