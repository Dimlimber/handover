// lp/get-ready-b.html asks the quiz's first question ("What kind of business is it?") on the landing
// page itself and links each answer to score.html?industry=<key>&start=1, which opens on the next
// question. These tests fail if the page and the quiz ever drift apart: edit both, or neither.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PROFILE_QUESTIONS } from '../js/questions.js';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const lp = read('../lp/get-ready-b.html');
const score = read('../score.html');

const links = [...lp.matchAll(/<a href="\/score\.html\?industry=([a-z]+)&amp;start=1">([^<]+)<\/a>/g)]
  .map((m) => ({ key: m[1], label: m[2] }));

function industryKeys() {
  const m = score.match(/const INDUSTRY_KEYS = (\{[^}]+\});/);
  assert.ok(m, 'INDUSTRY_KEYS not found in score.html');
  return new Function(`return ${m[1]};`)();
}

test('landing page B asks the quiz’s own first question, with the same answers in the same order', () => {
  const first = PROFILE_QUESTIONS[0];
  assert.ok(lp.includes(`>${first.text}</h2>`), 'the question text differs from the quiz');
  assert.deepEqual(links.map((l) => l.label), first.options);
});

test('every answer on landing page B opens the quiz with that industry chosen', () => {
  const keys = industryKeys();
  links.forEach((l, i) => assert.equal(keys[l.key], i, l.label));
});

test('score.html opens on the next question when the landing page has asked the first one', () => {
  assert.match(score, /autoStart = 'industry' in chosen && params\.get\('start'\) === '1'/);
  assert.match(score, /if \(autoStart\) \{\s*trackOnce\('quiz_start'\); at = 0; render\('quiz'\);/);
  assert.match(score, /if \(autoStart\) \{ history\.back\(\); return; \}/);
});

test('the links already in use keep working', () => {
  const keys = industryKeys();
  assert.deepEqual([keys.home, keys.trades, keys.manufacturing, keys.distribution, keys.wholesale, keys.healthcare], [0, 0, 1, 2, 2, 5]);
});
