// ES/EN metric aliases + lang fallback that never throws on the chat path (ST-7 / X2/X4/X5).
export const METRIC_ALIASES = {
  en: { loads_this_week: ['loads', 'week'], adjunto_score: ['score', 'adjunto'] },
  es: { loads_this_week: ['cargas', 'semana'], adjunto_score: ['score', 'adjunto'] },
};
const KEYS = {
  en: { denied_sender: 'Not authorized.', provenance_unverifiable: 'Unverifiable provenance.', not_measured: 'not measured yet' },
  es: { denied_sender: 'No autorizado.', provenance_unverifiable: 'Procedencia no verificable.', not_measured: 'aún no medido' },
};

export function normLang(l) { return l === 'es' || l === 'en' ? l : 'en'; }

// A fact matches when its metric tokens OR its lang-alias tokens all appear in the question.
export function matchMetric(question, metric, lang) {
  const q = String(question).toLowerCase();
  const aliases = (METRIC_ALIASES[normLang(lang)] || {})[metric] || [metric];
  return aliases.every(tok => q.includes(tok));
}

export function t(lang, key) {
  const table = KEYS[lang]; // intentionally strict for unknown langs (defense in depth)
  if (!table || !(key in table)) throw new Error('i18n-missing:' + lang + ':' + key);
  return table[key];
}
