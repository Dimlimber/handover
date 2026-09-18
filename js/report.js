import { AREAS, QUESTIONS, PROFILE_QUESTIONS } from './questions.js';
import { score } from './scoring.js';
import { CONTENT } from './report-content.js';

const VERDICTS = ['Serious gap', 'Gap', 'Minor gap', 'Strong']; // indexed by points
const [INDUSTRY, REVENUE] = PROFILE_QUESTIONS;

// Answers travel in the report link as "industry-revenue-14 digits". No personal details.
export function encodeAnswers(chosen) {
  return `${chosen.industry}-${chosen.revenue}-${QUESTIONS.map((q) => chosen[q.id]).join('')}`;
}

export function decodeAnswers(code) {
  const m = new RegExp(`^(\\d+)-(\\d+)-([0-3]{${QUESTIONS.length}})$`).exec(code);
  if (!m) return null;
  const industry = INDUSTRY.options[Number(m[1])];
  const revenue = REVENUE.options[Number(m[2])];
  if (!industry || !revenue) return null;
  const answers = Object.fromEntries(QUESTIONS.map((q, i) => [q.id, Number(m[3][i])]));
  return { industry, revenue, answers };
}

export function buildReport(answers) {
  const result = score(answers);
  const percent = Object.fromEntries(result.areas.map((a) => [a.key, a.percent]));

  const items = QUESTIONS.map((q) => {
    const { points, label } = q.options[answers[q.id]];
    const area = AREAS.find((a) => a.key === q.area);
    const inArea = QUESTIONS.filter((x) => x.area === q.area).length;
    return {
      id: q.id,
      areaKey: q.area,
      area: area.label,
      text: q.text,
      answer: label,
      points,
      verdict: VERDICTS[points],
      title: CONTENT[q.id].title,
      why: CONTENT[q.id].why,
      fix: points < 3 ? CONTENT[q.id].fix : null,
      // Points this answer costs on the 100-point score.
      cost: ((3 - points) / 3) * (area.weight / inArea),
    };
  });

  const sections = AREAS
    .map((a) => ({
      key: a.key, label: a.label, weight: a.weight, percent: percent[a.key], advice: a.advice,
      items: items.filter((i) => i.areaKey === a.key),
    }))
    .sort((a, b) => a.percent - b.percent || b.weight - a.weight);

  const actions = items
    .filter((i) => i.points < 3)
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 5)
    .map(({ id, area, title, fix }) => ({ id, area, title, fix }));

  return { ...result, sections, actions };
}
