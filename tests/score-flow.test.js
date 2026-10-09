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
