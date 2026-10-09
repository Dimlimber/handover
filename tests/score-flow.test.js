// score.html shows the score straight after the last question; the form on that screen unlocks the
// written report. These tests pin the structure and the copy the research and the spec settled on.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const score = read('../score.html');
const lp = read('../lp/get-ready-b.html');
const start = score.indexOf('<section class="view" id="result"');
const result = score.slice(start, score.indexOf('</section>', start));

test('the separate email screen is gone', () => {
  assert.ok(start > 0, 'result section present');
  assert.ok(!score.includes('id="details"'));
  assert.ok(!score.includes('Show my score'));
  assert.ok(!score.includes('Where should we send your report?'));
});

test('the report offer sits on the score screen: bars, gaps, offer, then the on-its-way block and the call block', () => {
  const marks = ['id="rBars"', 'id="rGaps"', 'id="offer"', 'id="lead"', 'id="sent"', 'class="talk"'];
  const at = marks.map((m) => result.indexOf(m));
  at.forEach((i, k) => assert.ok(i >= 0 && (k === 0 || i > at[k - 1]), marks[k]));
  assert.match(result, /<div class="sent" id="sent" tabindex="-1" hidden>/);
});

test('the form asks for a first name and an email, folds phone and business name away, and names the exchange', () => {
  assert.match(result, /<input id="fName" name="name"[^>]*\brequired>/);
  assert.match(result, /<input id="fEmail" name="email" type="email"[^>]*\brequired>/);
  const more = result.slice(result.indexOf('<details class="more" id="more">'), result.indexOf('</details>'));
  assert.ok(more.includes('<summary>Add a phone number or business name (optional)</summary>'));
  assert.ok(more.includes('id="fPhone"') && more.includes('id="fBiz"'));
  assert.ok(!/<input id="fPhone"[^>]*\brequired/.test(result) && !/<input id="fBiz"[^>]*\brequired/.test(result));
  assert.ok(result.includes('name="website"'), 'honeypot kept');
  assert.ok(result.includes('<h2 class="d-m" id="offerH" tabindex="-1">Get the full written report</h2>'));
  assert.ok(result.includes('What to do about each gap, by email within a few minutes, with a PDF you can keep.'));
  assert.ok(result.includes('<button class="btn" id="send" type="submit"><span>Email me the report</span></button>'));
  assert.ok(result.includes('Confidential. We never contact anyone but you, and we don’t add you to any list.'));
});

test('the script shows the score straight after the last question and never routes through a details view', () => {
  assert.match(score, /renderResult\(\);\s*trackOnce\('quiz_complete', \{ band: result\.band\.key \}\);\s*go\('result'\);/);
  assert.ok(!score.includes("'details'"), 'no details view in the script');
  assert.ok(!score.includes('dTitle') && !score.includes('dBack'));
  assert.ok(score.includes("['intro', 'quiz', 'result'].forEach"));
});

test('the lead event still fires on the form, and the advice renders only once the report is unlocked', () => {
  assert.ok(score.includes("trackOnce('generate_lead', { method: 'readiness_score' })"));
  assert.ok(score.includes('let unlocked = false;'));
  assert.match(score, /function renderGaps\(\) \{[\s\S]*?if \(unlocked\) \{[\s\S]*?\.advice;[\s\S]*?\n\}/);
  assert.match(score, /function unlock\(\) \{[\s\S]*?unlocked = true;[\s\S]*?renderGaps\(\);[\s\S]*?offer\.hidden = true;[\s\S]*?\n\}/);
  assert.ok(!score.includes("go('result');\n});"), 'the submit handler no longer navigates: it unlocks in place');
});

test('the promise stays true on both pages, and page B counts the questions honestly', () => {
  assert.ok(score.includes('You’ll see your score straight away, and we’ll email you a full written report.'));
  assert.ok(lp.includes('<p class="lede">Two quick questions about the business, then fourteen. About ten minutes. You’ll see your score straight away, and we’ll email you a full written report.</p>'));
  assert.ok(!lp.includes('Fourteen questions, about ten minutes. You’ll'));
});
