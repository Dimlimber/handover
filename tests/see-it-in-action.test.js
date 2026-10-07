// see-it-in-action.html is a demo deal room with two made-up sample businesses
// (an HVAC company in Pennsylvania and a diner in upstate New York). Each sample's
// figures live in one inline JSON block (#sample-<id>). These tests fail if the
// invented numbers stop adding up, if a link points at a file that doesn't exist,
// if the page gets listed, or if the site menu loses its link to the demo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = f => readFileSync(new URL(f, import.meta.url), 'utf8');
const html = read('../see-it-in-action.html');
const SAMPLES = [...html.matchAll(/<script type="application\/json" id="sample-([a-z]+)">([\s\S]*?)<\/script>/g)]
  .map(([, id, json]) => [id, JSON.parse(json)]);
const sum = a => a.reduce((s, x) => s + x, 0);
const r1 = x => Math.round(x * 10) / 10;
const blocksOf = D => D.customersPage.blocks.flatMap(b => (b.type === 'pair' ? [b.left, b.right] : [b]));

test('the page carries both samples, each with its own codes', () => {
  assert.deepEqual(SAMPLES.map(([id]) => id), ['laurel', 'maple']);
  const codes = SAMPLES.flatMap(([, D]) => [D.meta.codes.owner, D.meta.codes.buyer, ...D.meta.codes.alias]);
  assert.equal(new Set(codes).size, codes.length, 'every code is unique');
  const fileIds = SAMPLES.flatMap(([, D]) => D.documents.folders.flatMap(f => f.files.map(x => x.id)));
  assert.equal(new Set(fileIds).size, fileIds.length, 'file ids are unique across samples');
});

for (const [id, D] of SAMPLES) {
  const files = D.documents.folders.flatMap(f => f.files);
  const ids = new Set(files.map(f => f.id));

  test(`${id}: revenue lines add up and gross margins match gross profit`, () => {
    D.years.forEach((y, i) => {
      assert.equal(sum(D.revenue.lines.map(l => l.values[i])), D.revenue.total[i], y);
      assert.equal(r1(D.revenue.grossProfit[i] / D.revenue.total[i] * 100), D.revenue.grossMargin[i], y);
    });
  });

  test(`${id}: every bridge column adds up`, () => {
    const B = D.bridge;
    D.years.forEach((y, i) => {
      assert.equal(B.start.values[i] + sum(B.financing.map(f => f.values[i])), B.ebitda[i], y);
      assert.equal(B.ebitda[i] + sum(B.adjustments.map(a => a.values[i])), B.adjusted[i], y);
      assert.equal(r1(B.adjusted[i] / D.revenue.total[i] * 100), B.margin[i], y);
    });
    assert.ok(Math.max(...B.adjusted, ...B.ebitda) <= B.max, 'the chart scale fits every bar');
    assert.ok(D.cards.financials.includes(String(B.adjustments.length)) || D.cards.financials.includes(['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'][B.adjustments.length]), 'card names the adjustment count');
  });

  test(`${id}: customer exhibits add up`, () => {
    assert.equal(sum(D.monthly.values), D.revenue.total[2], 'monthly sales = the year');
    for (const b of blocksOf(D)) {
      if (b.sum100) assert.equal(r1(sum((b.segments || b.rows).map(x => x.share))), 100, b.title);
      if (b.type === 'stack') {
        assert.equal(r1(sum(b.table.rows.map(r => r.share))), r1(b.segments[0].share + b.segments[1].share), 'ten largest = largest + next nine');
        assert.equal(b.table.rows[0].share, b.segments[0].share, 'largest account');
      }
    }
  });

  test(`${id}: value ranges are earnings times multiples`, () => {
    const V = D.value, step = V.round;
    for (const k of ['today', 'closed']) {
      const v = V[k];
      assert.equal(Math.round(v.earnings * v.low / step) * step, v.rangeLow, k);
      assert.equal(Math.round(v.earnings * v.high / step) * step, v.rangeHigh, k);
      assert.ok(v.rangeLow >= V.axis.min && v.rangeHigh <= V.axis.max, `${k} fits the chart`);
    }
    assert.equal(V.today.earnings, D.bridge.adjusted[3], 'today = last 12 months earnings');
    assert.equal(V.closed.earnings, V.today.earnings + sum(V.earningsChange.map(e => e.value)), 'closed = today + changes');
    assert.equal(V.comps.length, 24);
    for (const c of V.comps) assert.ok(c.m >= V.compAxis.min && c.m <= V.compAxis.max, String(c.m));
  });

  test(`${id}: documents have unique ids, valid statuses, and every link resolves`, () => {
    assert.equal(ids.size, files.length);
    for (const f of files) assert.ok(['ready', 'offer', 'missing'].includes(f.status), f.id);
    const qa = blocksOf(D).filter(b => b.type === 'qa').flatMap(b => b.items);
    const links = [...D.bridge.adjustments, ...D.bridge.financing].map(a => a.doc)
      .concat(D.bridge.start.docs, D.fixit.items.map(i => i.doc), D.financialsPage.qa.map(q => q.doc), qa.map(q => q.doc));
    for (const l of links) assert.ok(ids.has(l), l);
    assert.ok(D.cards.documents.startsWith(`${files.length} files`), 'card states the file count');
    const inPlace = files.filter(f => f.status !== 'missing').length;
    assert.ok(D.documentsPage.sellerShort[1].startsWith(`${inPlace} are in place`), 'short version states how many are in place');
    for (const f of files.filter(x => x.fix)) assert.ok(D.fixit.items.some(i => i.id === f.fix && i.doc === f.id), f.id);
  });

  test(`${id}: fix-it points match the score`, () => {
    const F = D.fixit;
    assert.equal(F.start + sum(F.items.filter(i => i.status === 'done').map(i => i.points)), F.now);
    assert.equal(F.start + sum(F.items.map(i => i.points)), F.goal);
    for (const m of D.value.moves) for (const n of m.fix) assert.ok(F.items.some(i => i.id === n), String(n));
  });

  test(`${id}: no em dashes in the copy`, () => {
    assert.ok(!JSON.stringify(D).includes('—'));
  });
}

test('the page stays out of search, and its own text has no em dashes', () => {
  assert.match(html, /<meta name="robots" content="noindex">/);
  for (const f of ['../sitemap.xml', '../llms.txt']) assert.ok(!read(f).includes('see-it-in-action'), f);
  const visible = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');
  assert.ok(!visible.includes('—'), 'no em dashes in the page text');
});

test('every page menu links to the demo', () => {
  for (const f of ['index.html', 'brokers.html', 'about.html', 'faq.html', 'score.html', 'report.html', 'deliver.html', 'legal.html', 'privacy.html', '../templates/guides-shell.html']) {
    const nav = read(`../${f}`).match(/<nav class="(?:nav-links|site-nav)"[\s\S]*?<\/nav>/);
    assert.ok(nav, `${f} has a menu`);
    assert.match(nav[0], /href="\/?see-it-in-action"[^>]*>See it in action</, f);
  }
});
