// The demo deal room's seller view has a Buyer activity page: who opened the room, how often,
// when, and what they read. Each sample's made-up visit log lives in its JSON block
// (#sample-<id>, key "activity"); the page turns it into numbers, labels and rankings with the
// small model in <script id="activity-model">, which these tests run directly.
// They fail if a visit points at a buyer, section or file that doesn't exist, if a buyer
// "opens" a file they can't open, if a visit falls outside the room's dates, or if the model
// stops applying the interest rule the page prints, mis-times your own visits, or misdates a visit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../see-it-in-action.html', import.meta.url), 'utf8');
const SAMPLES = [...html.matchAll(/<script type="application\/json" id="sample-([a-z]+)">([\s\S]*?)<\/script>/g)]
  .map(([, id, json]) => [id, JSON.parse(json)]);
const modelSrc = (html.match(/<script id="activity-model">([\s\S]*?)<\/script>/) || [])[1];
const win = {};
if (modelSrc) new Function('window', modelSrc)(win);
const RA = win.RoomActivity;

const SECTIONS = ['start', 'story', 'financials', 'customers', 'documents'];
const MIN = 6e4;

// Wednesday 14 October 2026, 3 pm, in this machine's time zone (the page uses the viewer's).
const NOW = new Date(2026, 9, 14, 15, 0).getTime();

function fixture() {
  return {
    meta: { buyerName: 'Demo Buyer' },
    documents: { folders: [
      { id: '01', name: 'Financials', files: [
        { id: 'x-recast', name: 'Recast financials', status: 'ready' },
        { id: 'x-tax', name: 'Federal tax return, 2025', status: 'ready' }] },
      { id: '02', name: 'Property', files: [
        { id: 'x-lease', name: 'Signed lease renewal', status: 'missing', fix: 3 },
        { id: 'x-list', name: 'Plan member list', status: 'offer' }] }] },
    activity: {
      opened: 20,
      buyers: [
        { id: 'w', type: 'Trade buyer', kind: 'Strategic', invited: 20, people: [{ id: 'w1', role: 'Deal lead' }, { id: 'w2', role: 'Their lender' }] },
        { id: 'x', type: 'Private equity firm', kind: 'Financial', invited: 20, people: [{ id: 'x1', role: 'Deal lead' }] },
        { id: 'y', type: 'Family office', kind: 'Investor', invited: 18, people: [{ id: 'y1', role: 'Investment manager' }] },
        { id: 'z', type: 'Search fund', kind: 'Individual', invited: 9, people: [{ id: 'z1', role: 'Searcher' }] }],
      visits: [
        { b: 'w', p: 'w1', ago: 125, dev: 'computer', s: [['sec', 'financials', 20], ['file', 'x-tax', 10], ['dl', 'x-tax']] },
        { b: 'w', p: 'w2', d: 2, t: '10:30', dev: 'computer', s: [['file', 'x-tax', 15], ['try', 'x-lease']] },
        { b: 'w', p: 'w1', d: 6, t: '19:42', dev: 'phone', s: [['sec', 'story', 12], ['try', 'x-lease'], ['try', 'x-lease']] },
        { b: 'x', p: 'x1', d: 1, t: '08:00', dev: 'computer', s: [['sec', 'story', 30]] },
        { b: 'x', p: 'x1', d: 7, t: '08:00', dev: 'computer', s: [['sec', 'customers', 25], ['try', 'x-list']] },
        { b: 'y', p: 'y1', d: 12, t: '16:05', dev: 'tablet', s: [['sec', 'story', 9], ['try', 'x-lease']] }]
    }
  };
}

// One visit made in this browser in the buyer view: 10 minutes ago, for 5 minutes.
function myVisit() {
  const t0 = NOW - 10 * MIN;
  return [{ start: t0, end: t0 + 5 * MIN, dev: 'phone', steps: [
    ['sec', 'start', t0],
    ['sec', 'financials', t0 + 0.5 * MIN],
    ['file', 'x-tax', t0 + 2.5 * MIN],
    ['dl', 'x-tax', t0 + 3 * MIN],
    ['sec', 'financials', t0 + 3.5 * MIN],
    ['try', 'x-list', t0 + 4 * MIN]] }];
}

test('the page carries the activity model', () => {
  assert.ok(modelSrc, 'a <script id="activity-model"> block');
  assert.equal(typeof RA.build, 'function');
});

test('interest levels follow the rule printed on the page', () => {
  const M = RA.build(fixture(), [], NOW);
  const level = id => M.buyers.find(b => b.id === id).level;
  assert.equal(level('w'), 'hot', 'three visits in the last 7 days, the oldest 6 days ago');
  assert.equal(level('x'), 'on', 'one visit yesterday; the one 7 days ago is outside the window');
  assert.equal(level('y'), 'quiet', 'last visit 12 days ago');
  assert.equal(level('z'), 'none', 'code never used');
});

test('buyers are ranked by level, then by time spent in the last 7 days', () => {
  const M = RA.build(fixture(), myVisit(), NOW);
  assert.deepEqual([...M.buyers.map(b => b.id)], ['w', 'x', 'you', 'y', 'z']);
});

test('counts and minutes come from the visit log', () => {
  const M = RA.build(fixture(), [], NOW);
  const w = M.buyers.find(b => b.id === 'w');
  assert.equal(w.n, 3);
  assert.equal(w.min, 57);
  assert.equal(w.dl, 1);
  assert.deepEqual([...w.files], ['x-tax']);
  assert.equal(M.totals.buyers, 4);
  assert.equal(M.totals.opened, 3);
  assert.equal(M.totals.visits, 6);
  assert.equal(M.totals.n7, 4);
  assert.equal(M.totals.min, 121);
  assert.equal(M.last.buyer.id, 'w');
});

test('a buyer who tries a file again still counts once, and the most-tried missing file points to its fix-it item', () => {
  const M = RA.build(fixture(), [], NOW);
  assert.deepEqual(M.tried.map(t => [t.file.id, t.buyers]), [['x-lease', 2], ['x-list', 1]]);
  const s = M.signals.find(x => x.kind === 'tried');
  assert.equal(s.file, 'x-lease');
  assert.equal(s.n, 2);
  assert.equal(s.fix, 3);
});

test('your own visit is timed from the moments you moved, and joins the room as a buyer', () => {
  const M = RA.build(fixture(), myVisit(), NOW);
  const you = M.buyers.find(b => b.id === 'you');
  assert.equal(you.you, true);
  assert.equal(you.label, 'Demo Buyer');
  assert.equal(you.n, 1);
  const v = M.visits.find(x => x.you);
  assert.deepEqual(v.steps.filter(s => s.min > 0).map(s => [s.k, s.id, s.min]),
    [['sec', 'start', 0.5], ['sec', 'financials', 2], ['file', 'x-tax', 1], ['sec', 'financials', 1.5]]);
  assert.equal(v.min, 5);
  assert.equal(M.totals.buyers, 5);
  assert.equal(M.totals.opened, 4);
  assert.deepEqual(M.tried.map(t => [t.file.id, t.buyers]), [['x-lease', 2], ['x-list', 2]]);
});

test('with no visits of your own, Demo Buyer is not in the list', () => {
  const M = RA.build(fixture(), [], NOW);
  assert.equal(M.buyers.some(b => b.id === 'you'), false);
});

test('a visit reads as today, yesterday, or its weekday and date', () => {
  const M = RA.build(fixture(), [], NOW);
  const at = (b, d) => M.visits.find(v => v.buyer.id === b && v.d === d);
  assert.equal(RA.when(M.visits[0].ts, NOW), 'Today, 12:55 pm');
  assert.equal(RA.when(at('x', 1).ts, NOW), 'Yesterday, 8:00 am');
  assert.equal(RA.when(at('w', 6).ts, NOW), 'Thu 8 Oct, 7:42 pm');
  assert.equal(RA.ago(M.visits[0].ts, NOW), '2 hours ago');
  assert.equal(RA.ago(at('y', 12).ts, NOW), '12 days ago');
});

test('lengths read in seconds, minutes or hours, and no time reads as none', () => {
  assert.deepEqual([0, 0.5, 57, 120, 789].map(RA.dur), ['0 min', '30 sec', '57 min', '2 h', '13 h 9 min']);
});

test('the headline counts in words', () => {
  const M = RA.build(fixture(), [], NOW);
  assert.match(M.headline, /^Three of four buyers have opened the room\. One is reading closely\.$/);
});

for (const [id, D] of SAMPLES) {
  const A = D.activity;
  const files = Object.fromEntries(D.documents.folders.flatMap(f => f.files).map(f => [f.id, f]));

  test(`${id}: every visit names a real buyer and one of that buyer's people`, () => {
    assert.ok(A && A.buyers.length >= 5 && A.visits.length >= 20, 'a believable log');
    const buyers = Object.fromEntries(A.buyers.map(b => [b.id, b]));
    assert.equal(Object.keys(buyers).length, A.buyers.length, 'buyer ids are unique');
    const people = A.buyers.flatMap(b => b.people.map(p => p.id));
    assert.equal(new Set(people).size, people.length, 'person ids are unique');
    for (const v of A.visits) {
      assert.ok(buyers[v.b], v.b);
      assert.ok(buyers[v.b].people.some(p => p.id === v.p), `${v.p} works for buyer ${v.b}`);
    }
  });

  test(`${id}: buyers only read sections they can open and files a buyer can open`, () => {
    for (const v of A.visits) {
      const opened = new Set();
      for (const [k, x, m] of v.s) {
        if (k === 'sec') assert.ok(SECTIONS.includes(x), x);
        else if (k === 'file') { assert.equal(files[x]?.status, 'ready', x); opened.add(x); }
        else if (k === 'dl') assert.ok(opened.has(x), `${x} is opened before it is downloaded`);
        else if (k === 'try') assert.ok(['offer', 'missing'].includes(files[x]?.status), x);
        else assert.fail(`unknown step ${k}`);
        if (k === 'sec' || k === 'file') assert.ok(m > 0 && m <= 90, `${x}: ${m} minutes`);
      }
    }
  });

  test(`${id}: every visit falls between the buyer's invitation and now`, () => {
    for (const b of A.buyers) assert.ok(b.invited >= 1 && b.invited <= A.opened, b.id);
    for (const v of A.visits) {
      const b = A.buyers.find(x => x.id === v.b);
      if ('ago' in v) assert.ok(v.ago > 0 && v.ago <= 600 && !('d' in v), 'today: minutes ago');
      else {
        assert.ok(v.d >= 1 && v.d <= b.invited, `${v.b} visited ${v.d} days ago, invited ${b.invited}`);
        assert.match(v.t, /^([01]\d|2[0-3]):[0-5]\d$/);
      }
      assert.ok(['computer', 'phone', 'tablet'].includes(v.dev), v.dev);
    }
  });

  test(`${id}: the sample shows every interest level`, () => {
    const M = RA.build(D, [], NOW);
    assert.deepEqual([...new Set(M.buyers.map(b => b.level))].sort(), ['hot', 'none', 'on', 'quiet']);
  });
}
