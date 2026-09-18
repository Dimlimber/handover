import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS, PROFILE_QUESTIONS } from '../js/questions.js';
import { CONTENT } from '../js/report-content.js';
import { encodeAnswers, decodeAnswers, buildReport } from '../js/report.js';

const all = (index) => Object.fromEntries(QUESTIONS.map((q) => [q.id, index]));

test('every question has a title, a why and a fix', () => {
  for (const q of QUESTIONS) {
    const c = CONTENT[q.id];
    assert.ok(c && c.title && c.why && c.fix, q.id);
  }
});

test('encode then decode round-trips answers and profile', () => {
  const chosen = { ...all(2), industry: 4, revenue: 1, f1: 0, s2: 3 };
  const code = encodeAnswers(chosen);
  assert.match(code, /^\d+-\d+-[0-3]{14}$/);
  const back = decodeAnswers(code);
  assert.deepEqual(back.answers, { ...all(2), f1: 0, s2: 3 });
  assert.equal(back.industry, PROFILE_QUESTIONS[0].options[4]);
  assert.equal(back.revenue, PROFILE_QUESTIONS[1].options[1]);
});

test('decode rejects anything malformed', () => {
  for (const bad of ['', 'abc', '0-0-123', '0-0-44444444444444', '99-0-00000000000000', '0-99-00000000000000']) {
    assert.equal(decodeAnswers(bad), null, bad);
  }
});

test('sections are ordered weakest first and carry every question', () => {
  const answers = all(0);
  answers.o1 = 3; answers.o2 = 3; answers.o3 = 3;
  answers.p1 = 2;
  const r = buildReport(answers);
  assert.deepEqual(r.sections.slice(0, 2).map((s) => s.key), ['owner', 'operations']);
  assert.equal(r.sections.reduce((n, s) => n + s.items.length, 0), QUESTIONS.length);
  const o1 = r.sections[0].items.find((i) => i.id === 'o1');
  assert.equal(o1.verdict, 'Serious gap');
  assert.equal(o1.answer, 'It would stop');
  assert.ok(o1.fix);
});

test('a top answer is marked strong and needs no fix', () => {
  const r = buildReport(all(0));
  const item = r.sections[0].items[0];
  assert.equal(item.verdict, 'Strong');
  assert.equal(item.fix, null);
  assert.deepEqual(r.actions, []);
});

test('actions are the five costliest gaps, costliest first', () => {
  const r = buildReport(all(3));
  assert.equal(r.actions.length, 5);
  // Points lost per question = area weight / questions in the area.
  // owner 25/3 = 8.3, story 15/2 = 7.5, operations 15/2 = 7.5, financials 30/4 = 7.5, customers 15/3 = 5.
  assert.deepEqual(r.actions.slice(0, 3).map((a) => a.id), ['o1', 'o2', 'o3']);
  assert.ok(r.actions.every((a) => a.title && a.fix && a.area));
});

test('a smaller gap ranks below a bigger one in the same area', () => {
  const answers = all(0);
  answers.f1 = 1; answers.f2 = 3;
  const r = buildReport(answers);
  assert.deepEqual(r.actions.map((a) => a.id), ['f2', 'f1']);
});
