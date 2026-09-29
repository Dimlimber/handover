// The PDF brochure's document definition (the PDF itself is drawn in the browser by pdfmake).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reportDocDefinition } from '../js/report-pdf.js';

const texts = (node, out = []) => {
  if (node == null) return out;
  if (typeof node === 'string') { out.push(node); return out; }
  if (Array.isArray(node)) { node.forEach((n) => texts(n, out)); return out; }
  if (typeof node === 'object') for (const k of ['text', 'stack', 'columns', 'content', 'table', 'body']) texts(node[k], out);
  return out;
};
const all = (dd) => texts(dd.content).join(' ');

test('builds for the best and the worst answers, with the score on the cover', () => {
  const best = reportDocDefinition({ code: '0-0-00000000000000' });
  const worst = reportDocDefinition({ code: '0-0-33333333333333' });
  assert.match(all(best), /\b100\b/);
  assert.match(all(best), /Ready/);
  assert.match(all(worst), /Not ready yet/);
  assert.equal(best.pageSize, 'LETTER');
});

test('refuses an incomplete answers code', () => {
  assert.throws(() => reportDocDefinition({ code: '1-2-123' }));
  assert.throws(() => reportDocDefinition({ code: '' }));
});

test('names are printed when the fonts can print them, folded or left off when not', () => {
  const on = (name, business) => all(reportDocDefinition({ code: '1-2-20110111112111', name, business }));
  assert.match(on('José', 'Test Co'), /José, Test Co/);
  assert.match(on('Łucja', ''), /Lucja/);
  assert.doesNotMatch(on('李明', 'Acme'), /李明/);
  assert.match(on('李明', 'Acme'), /Prepared for/);
  assert.doesNotMatch(on('', ''), /Prepared for/);
});
