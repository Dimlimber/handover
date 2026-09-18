import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AREAS, QUESTIONS } from '../js/questions.js';
import { isComplete, score } from '../js/scoring.js';

const all = (index) => Object.fromEntries(QUESTIONS.map((q) => [q.id, index]));

test('area weights sum to 100', () => {
  assert.equal(AREAS.reduce((s, a) => s + a.weight, 0), 100);
});

test('every question belongs to a known area and has four options scored 3..0', () => {
  const keys = new Set(AREAS.map((a) => a.key));
  for (const q of QUESTIONS) {
    assert.ok(keys.has(q.area), q.id);
    assert.deepEqual(q.options.map((o) => o.points), [3, 2, 1, 0], q.id);
  }
});

test('isComplete is false until every scored question is answered', () => {
  const answers = all(0);
  assert.equal(isComplete(answers), true);
  delete answers.s2;
  assert.equal(isComplete(answers), false);
});

test('score throws on incomplete answers', () => {
  assert.throws(() => score({ f1: 0 }), /incomplete/);
});

test('all best answers score 100, band ready, no gaps', () => {
  const r = score(all(0));
  assert.equal(r.total, 100);
  assert.equal(r.band.key, 'ready');
  assert.deepEqual(r.gaps, []);
});

test('all worst answers score 0, band not-ready, three gaps ordered by weight', () => {
  const r = score(all(3));
  assert.equal(r.total, 0);
  assert.equal(r.band.key, 'not-ready');
  assert.deepEqual(r.gaps.map((g) => g.key), ['financials', 'owner', 'customers']);
});

test('weights are applied per area', () => {
  // Perfect everywhere except financials, which is all-worst: 100 - 30 = 70.
  const answers = all(0);
  for (const q of QUESTIONS) if (q.area === 'financials') answers[q.id] = 3;
  const r = score(answers);
  assert.equal(r.total, 70);
  assert.equal(r.band.key, 'nearly-ready');
  assert.deepEqual(r.gaps.map((g) => g.key), ['financials']);
  assert.equal(r.areas.find((a) => a.key === 'financials').percent, 0);
});

test('gaps are the three weakest areas, weakest first', () => {
  const answers = all(0);
  answers.o1 = 3; answers.o2 = 3; answers.o3 = 3;   // owner 0%
  answers.s1 = 2; answers.s2 = 2;                   // story 33%
  answers.p1 = 1;                                   // operations 83%
  answers.c1 = 1;                                   // customers 89%
  const r = score(answers);
  assert.deepEqual(r.gaps.map((g) => g.key), ['owner', 'story', 'operations']);
  assert.ok(r.gaps[0].advice.length > 0);
});

test('band boundaries', () => {
  const weak = all(0); // financials and owner all-worst: 100 - 30 - 25 = 45
  for (const q of QUESTIONS) if (q.area === 'financials' || q.area === 'owner') weak[q.id] = 3;
  assert.equal(score(weak).total, 45);
  assert.equal(score(weak).band.key, 'needs-work');
  const mid = all(1); // every area 2/3 -> 67
  assert.equal(score(mid).total, 67);
  assert.equal(score(mid).band.key, 'nearly-ready');
  const low = all(2); // every area 1/3 -> 33
  assert.equal(score(low).total, 33);
  assert.equal(score(low).band.key, 'not-ready');
});
