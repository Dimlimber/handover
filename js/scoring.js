import { AREAS, QUESTIONS } from './questions.js';

const BANDS = [
  { min: 85, key: 'ready', label: 'Ready',
    summary: 'Your business would stand up well to a buyer’s checks. The work now is presentation and timing.' },
  { min: 65, key: 'nearly-ready', label: 'Nearly ready',
    summary: 'The foundations are there. A few specific gaps are likely to cost you on price or slow a sale down.' },
  { min: 40, key: 'needs-work', label: 'Needs work',
    summary: 'A buyer would find real problems today. Most of them can be fixed in a few months, before you go to market.' },
  { min: 0, key: 'not-ready', label: 'Not ready yet',
    summary: 'Listing now would most likely end without a sale. The good news is that the causes are known and fixable.' },
];

export function isComplete(answers) {
  return QUESTIONS.every((q) => Number.isInteger(answers[q.id])
    && answers[q.id] >= 0 && answers[q.id] < q.options.length);
}

export function score(answers) {
  if (!isComplete(answers)) throw new Error('incomplete');

  const areas = AREAS.map((area) => {
    const qs = QUESTIONS.filter((q) => q.area === area.key);
    const got = qs.reduce((s, q) => s + q.options[answers[q.id]].points, 0);
    const fraction = got / (qs.length * 3);
    return { ...area, fraction, percent: Math.round(fraction * 100) };
  });

  const total = Math.round(areas.reduce((s, a) => s + a.fraction * a.weight, 0));
  const { min, ...band } = BANDS.find((b) => total >= b.min);

  const gaps = areas
    .filter((a) => a.fraction < 1)
    .sort((a, b) => a.fraction - b.fraction || b.weight - a.weight)
    .slice(0, 3)
    .map(({ key, label, advice }) => ({ key, label, advice }));

  return {
    total,
    band,
    areas: areas.map(({ key, label, percent }) => ({ key, label, percent })),
    gaps,
  };
}
