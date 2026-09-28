// score.html carries its own inline copy of the questions and scoring (the page is self-contained).
// report.html and the other tests use js/questions.js, js/scoring.js and js/report.js.
// These tests fail if the two copies ever drift apart: edit both, or neither.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { AREAS, QUESTIONS, PROFILE_QUESTIONS } from '../js/questions.js';
import { score } from '../js/scoring.js';
import { encodeAnswers } from '../js/report.js';

function inlineQuiz() {
  const html = readFileSync(new URL('../score.html', import.meta.url), 'utf8');
  const start = html.indexOf('const AREAS = [');
  const fn = html.indexOf('function encodeAnswers(', start);
  assert.ok(start > 0 && fn > start, 'inline quiz data not found in score.html');
  let depth = 0, end = html.indexOf('{', fn);
  for (let i = end; i < html.length; i++) {
    if (html[i] === '{') depth++;
    if (html[i] === '}' && --depth === 0) { end = i + 1; break; }
  }
  const block = html.slice(start, end);
  return new Function(`${block}\nreturn { AREAS, QUESTIONS, PROFILE_QUESTIONS, score, encodeAnswers };`)();
}

const page = inlineQuiz();

test('score.html has the same areas, questions and profile questions as js/questions.js', () => {
  assert.deepEqual(page.AREAS, AREAS);
  assert.deepEqual(page.QUESTIONS, QUESTIONS);
  assert.deepEqual(page.PROFILE_QUESTIONS, PROFILE_QUESTIONS);
});

test('score.html scores and encodes exactly like js/scoring.js and js/report.js', () => {
  let seed = 7;
  const rand = (n) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
  for (let run = 0; run < 500; run++) {
    const answers = Object.fromEntries(QUESTIONS.map((q) => [q.id, rand(q.options.length)]));
    assert.deepEqual(page.score(answers), score(answers));
    const chosen = { ...answers, industry: rand(PROFILE_QUESTIONS[0].options.length), revenue: rand(PROFILE_QUESTIONS[1].options.length) };
    assert.equal(page.encodeAnswers(chosen), encodeAnswers(chosen));
  }
});
