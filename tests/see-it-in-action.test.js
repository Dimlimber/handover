// see-it-in-action.html is a demo deal room for a made-up HVAC company ("Project Laurel").
// Every figure lives in one inline JSON block (#laurel-data). These tests fail if the
// invented numbers stop adding up, if the page gets listed, or if the copy rules slip.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../see-it-in-action.html', import.meta.url), 'utf8');
const m = html.match(/<script type="application\/json" id="laurel-data">([\s\S]*?)<\/script>/);
assert.ok(m, 'no #laurel-data block in see-it-in-action.html');
const D = JSON.parse(m[1]);
const sum = a => a.reduce((s, x) => s + x, 0);
const r1 = x => Math.round(x * 10) / 10;
const files = D.documents.folders.flatMap(f => f.files);
const fileIds = new Set(files.map(f => f.id));

test('revenue lines add up to the totals, and gross margins match gross profit', () => {
  D.years.forEach((y, i) => {
    assert.equal(sum(D.revenue.lines.map(l => l.values[i])), D.revenue.total[i], y);
    assert.equal(r1(D.revenue.grossProfit[i] / D.revenue.total[i] * 100), D.revenue.grossMargin[i], y);
  });
});

test('every bridge column adds up', () => {
  const B = D.bridge;
  D.years.forEach((y, i) => {
    assert.equal(B.start.values[i] + sum(B.financing.map(f => f.values[i])), B.ebitda[i], y);
    assert.equal(B.ebitda[i] + sum(B.adjustments.map(a => a.values[i])), B.adjusted[i], y);
    assert.equal(r1(B.adjusted[i] / D.revenue.total[i] * 100), B.margin[i], y);
  });
});

test('customer shares add up', () => {
  const C = D.customers;
  assert.equal(sum(C.monthly2025), D.revenue.total[2], 'monthly 2025 = 2025 revenue');
  for (const k of ['concentration', 'driveTime', 'leadSources']) assert.equal(r1(sum(C[k].map(x => x.share))), 100, k);
  assert.equal(r1(sum(C.top10.map(a => a.share))), r1(C.concentration[0].share + C.concentration[1].share), 'top ten = largest + next nine');
  assert.equal(C.top10[0].share, C.concentration[0].share, 'largest account');
  const line = id => D.revenue.lines.find(l => l.id === id).values[2];
  assert.equal(Math.round((line('plans') + line('commercial')) / D.revenue.total[2] * 100), C.recurringShare);
  assert.equal(C.members.at(-1).value, D.glance.find(g => g.id === 'members').value);
});

test('value ranges are earnings times multiples', () => {
  for (const k of ['today', 'closed']) {
    const v = D.value[k];
    assert.equal(r1(v.earnings * v.low), v.rangeLow, k);
    assert.equal(r1(v.earnings * v.high), v.rangeHigh, k);
  }
  assert.equal(D.value.today.earnings, Math.round(D.bridge.adjusted[3] / 10) / 100, 'today = last 12 months adjusted EBITDA');
  assert.equal(D.value.comps.length, 24);
});

test('the document room has 43 files, 3 missing, unique ids, and every link resolves', () => {
  assert.equal(files.length, 43);
  assert.equal(fileIds.size, files.length, 'file ids are unique');
  assert.equal(files.filter(f => f.status === 'missing').length, 3);
  for (const f of files) assert.ok(['ready', 'offer', 'missing'].includes(f.status), f.id);
  for (const a of [...D.bridge.adjustments, ...D.bridge.financing]) assert.ok(fileIds.has(a.doc), a.id);
  for (const it of D.fixit.items) if (it.doc) assert.ok(fileIds.has(it.doc), String(it.id));
});

test('fix-it points: 66 now, 88 when everything is done', () => {
  const F = D.fixit;
  assert.equal(F.start + sum(F.items.filter(i => i.status === 'done').map(i => i.points)), 66);
  assert.equal(F.start + sum(F.items.map(i => i.points)), 88);
});

test('the page stays unlisted, and the copy has no em dashes', () => {
  assert.match(html, /<meta name="robots" content="noindex">/);
  for (const f of ['../sitemap.xml', '../llms.txt']) {
    assert.ok(!readFileSync(new URL(f, import.meta.url), 'utf8').includes('see-it-in-action'), f);
  }
  assert.ok(!m[1].includes('—'), 'no em dashes in the data');
  const visible = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');
  assert.ok(!visible.includes('—'), 'no em dashes in the page text');
});
