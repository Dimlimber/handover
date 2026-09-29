// Industry versions of the questions: the same measure on the same scale, in each industry's words.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AREAS, QUESTIONS, PROFILE_QUESTIONS, INDUSTRY_LENS, VARIANTS, AREA_ADVICE, questionsFor, areasFor } from '../js/questions.js';
import { CONTENT, CONTENT_VARIANTS, contentFor } from '../js/report-content.js';
import { score } from '../js/scoring.js';
import { buildReport } from '../js/report.js';

const INDUSTRIES = PROFILE_QUESTIONS[0].options;
const LENSES = new Set(Object.values(INDUSTRY_LENS));

test('every industry but "Something else" has a set of wording, and every set is used', () => {
  for (const industry of INDUSTRIES) {
    if (industry === 'Something else') assert.equal(INDUSTRY_LENS[industry], undefined);
    else assert.ok(INDUSTRY_LENS[industry], industry);
  }
  assert.deepEqual(Object.keys(INDUSTRY_LENS).sort(), INDUSTRIES.filter((i) => i !== 'Something else').sort());
});

test('variants name real questions and industries, with four options when they replace them', () => {
  for (const [id, byLens] of Object.entries(VARIANTS)) {
    assert.ok(QUESTIONS.find((q) => q.id === id), id);
    for (const [lens, v] of Object.entries(byLens)) {
      assert.ok(LENSES.has(lens), `${id}/${lens}`);
      assert.ok(v.text || v.options, `${id}/${lens} changes nothing`);
      if (v.options) assert.equal(v.options.length, 4, `${id}/${lens}`);
    }
  }
  for (const byLens of Object.values(AREA_ADVICE)) for (const lens of Object.keys(byLens)) assert.ok(LENSES.has(lens), lens);
});

test('each industry sees the same questions, areas and points, in its own words', () => {
  for (const industry of INDUSTRIES) {
    const qs = questionsFor(industry);
    assert.deepEqual(qs.map((q) => [q.id, q.area]), QUESTIONS.map((q) => [q.id, q.area]), industry);
    for (const q of qs) assert.deepEqual(q.options.map((o) => o.points), [3, 2, 1, 0], `${industry} ${q.id}`);
    assert.deepEqual(areasFor(industry).map((a) => [a.key, a.weight]), AREAS.map((a) => [a.key, a.weight]));
  }
  assert.deepEqual(questionsFor('Something else'), QUESTIONS);
  assert.deepEqual(questionsFor(undefined), QUESTIONS);
});

test('where an industry sees different answers, the report explains them in its words', () => {
  for (const [id, byLens] of Object.entries(VARIANTS)) {
    for (const [lens, v] of Object.entries(byLens)) {
      if (v.options) assert.ok(CONTENT_VARIANTS[id] && CONTENT_VARIANTS[id][lens], `report words for ${id}/${lens}`);
    }
  }
  for (const industry of INDUSTRIES) {
    for (const q of QUESTIONS) {
      const c = contentFor(q.id, industry);
      assert.ok(c.title && c.why && c.fix, `${industry} ${q.id}`);
    }
  }
  assert.deepEqual(contentFor('c1', 'Something else'), CONTENT.c1);
});

test('the score does not depend on the industry; the report wording does', () => {
  const answers = Object.fromEntries(QUESTIONS.map((q, i) => [q.id, i % 4]));
  const base = score(answers);
  for (const industry of INDUSTRIES) assert.deepEqual(buildReport(answers, industry).total, base.total);
  const food = buildReport(answers, 'Restaurant or food');
  const c1 = food.sections.flatMap((s) => s.items).find((i) => i.id === 'c1');
  assert.match(c1.text, /delivery apps/);
  assert.equal(c1.title, 'Know your delivery-app share');
  assert.match(food.sections.find((s) => s.key === 'customers').advice, /delivery apps/);
});

test('wording follows the house style: curly apostrophes and quotes, no straight ones', () => {
  const strings = [];
  const walk = (v) => { if (typeof v === 'string') strings.push(v); else if (v && typeof v === 'object') Object.values(v).forEach(walk); };
  walk(VARIANTS); walk(AREA_ADVICE); walk(CONTENT_VARIANTS);
  for (const s of strings) assert.doesNotMatch(s, /['"]/, s);
});
