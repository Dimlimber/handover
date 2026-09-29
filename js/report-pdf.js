// The owner's sale-readiness report as a designed PDF brochure (US Letter).
// Built in the browser with pdfmake, from the same answers and wording as report.html, so the
// PDF someone downloads and the one we email are the same document.
//
//   const { base64, blob, filename } = await reportPdf({ code, name, business });
//   await downloadReportPdf({ code });
//
// code = the answers code from the report link (report.html#<code>). name/business are optional
// and only appear on the cover. pdfmake and the fonts load on first use.
import { decodeAnswers, buildReport } from './report.js';
import { AREAS } from './questions.js';
import { WORDMARK_SVG, WORDMARK_ASPECT } from './report-pdf-wordmark.js';

const C = { ink: '#1A1A18', ink2: '#6B6B66', hair: '#D8D8D2', track: '#ECECE7', green: '#1F4D3A', line: '#367D5D', wash: '#F6F6F3' };
const PAGE = { w: 612, h: 792, x: 60 };             // US Letter in points; 60pt side margins
const CONTENT_W = PAGE.w - PAGE.x * 2;
const FONT_FILES = {
  'NotoSerifDisplay-Light.ttf': 1, 'NotoSerifDisplay-SemiBold.ttf': 1, 'NotoSerifDisplay-LightItalic.ttf': 1,
  'ZenKakuGothicNew-Regular.ttf': 1, 'ZenKakuGothicNew-Medium.ttf': 1, 'ZenKakuGothicNew-Bold.ttf': 1,
};
const FILENAME = 'Handover sale-readiness report.pdf';

let ready = null;
function load() {
  if (ready) return ready;
  ready = (async () => {
    if (!window.pdfMake) {
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = new URL('./vendor/pdfmake.min.js', import.meta.url).href;
        s.onload = resolve; s.onerror = () => reject(new Error('pdfmake did not load'));
        document.head.append(s);
      });
    }
    const vfs = {};
    await Promise.all(Object.keys(FONT_FILES).map(async (f) => {
      const res = await fetch(new URL(`../fonts/${f}`, import.meta.url));
      if (!res.ok) throw new Error(`font ${f}: ${res.status}`);
      vfs[f] = toBase64(await res.arrayBuffer());
    }));
    window.pdfMake.vfs = vfs;
    window.pdfMake.fonts = {
      Serif: { normal: 'NotoSerifDisplay-Light.ttf', bold: 'NotoSerifDisplay-SemiBold.ttf', italics: 'NotoSerifDisplay-LightItalic.ttf', bolditalics: 'NotoSerifDisplay-SemiBold.ttf' },
      Sans: { normal: 'ZenKakuGothicNew-Regular.ttf', bold: 'ZenKakuGothicNew-Bold.ttf', italics: 'ZenKakuGothicNew-Regular.ttf', bolditalics: 'ZenKakuGothicNew-Bold.ttf' },
      SansMed: { normal: 'ZenKakuGothicNew-Medium.ttf', bold: 'ZenKakuGothicNew-Bold.ttf', italics: 'ZenKakuGothicNew-Medium.ttf', bolditalics: 'ZenKakuGothicNew-Bold.ttf' },
    };
    return window.pdfMake;
  })();
  ready.catch(() => { ready = null; });
  return ready;
}

function toBase64(buf) {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf); let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

// ---------- small building blocks ----------
// pdfmake multiplies each font's natural line height (Zen Kaku Gothic New 1.448 em, Noto Serif Display
// 1.362 em), so these factors give an actual line pitch of 1.5 em for text and about 1.15 em for headings.
const LH = { text: 1.5 / 1.448, tight: 1.35 / 1.448, head: 1.15 / 1.362, title: 1.12 / 1.362 };
// the cover numeral: Noto Serif Display digits are tabular, 0.559 em wide; ascender 1.069 em, digit height 0.724 em
const DIGIT_EM = 0.559, SERIF_ASC = 1.069, DIGIT_H = 0.724, SANS_ASC = 1.16;
// The sans fonts cover Basic Latin, Latin-1 and a little more. A name typed with other letters is folded
// to plain Latin (Łódź -> Lodz); if that still leaves something unprintable, that part is left off the cover.
const SANS_OK = /[\u0020-\u007E\u00A0-\u00FF\u0131\u0152\u0153\u0174-\u0178\u2010\u2013\u2014\u2018\u2019\u201A\u201C-\u201E\u2022\u2026\u2030\u2039\u203A\u20AC]/;
const FOLD = { 'Ł': 'L', 'ł': 'l', 'Đ': 'D', 'đ': 'd', 'Ħ': 'H', 'ħ': 'h', 'Ŀ': 'L', 'ŀ': 'l', 'Ŋ': 'N', 'ŋ': 'n', 'Ŧ': 'T', 'ŧ': 't', 'ĸ': 'k' };
function printable(s) {
  s = String(s || '').replace(/\s+/g, ' ').trim().slice(0, 80);
  let out = '';
  for (const ch of s) {
    if (SANS_OK.test(ch)) { out += ch; continue; }
    const folded = FOLD[ch] || ch.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (folded && [...folded].every((c) => SANS_OK.test(c))) { out += folded; continue; }
    return '';
  }
  return out;
}
const eyebrow = (text, extra = {}) => ({ text: text.toUpperCase(), font: 'SansMed', fontSize: 7.5, characterSpacing: 1.4, color: C.ink2, ...extra });
const h2 = (text, extra = {}) => ({ text, font: 'Serif', bold: true, fontSize: 23, lineHeight: LH.head, color: C.green, ...extra });
const body = (text, extra = {}) => ({ text, font: 'Sans', fontSize: 10.5, lineHeight: LH.text, color: C.ink, ...extra });
const rule = (top = 14, bottom = 14, w = CONTENT_W, color = C.hair) => ({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: w, y2: 0, lineWidth: 0.6, lineColor: color }], margin: [0, top, 0, bottom] });
const bar = (pct, w, h = 5) => ({ canvas: [
  { type: 'rect', x: 0, y: 0, w, h, color: C.track },
  pct > 0 ? { type: 'rect', x: 0, y: 0, w: Math.max(h, w * pct / 100), h, color: C.green } : null,
].filter(Boolean) });
// verdict scale, as on the report page: one filled dot per point the answer earns (Strong = all three,
// in green; the gaps in ink)
function verdictMark(points) {
  const col = points === 3 ? C.green : C.ink;
  const dots = [];
  for (let i = 0; i < 3; i++) dots.push({ type: 'ellipse', x: 3.2 + i * 9, y: 3.4, r1: 3, r2: 3, lineWidth: 0.8, lineColor: col, color: i < points ? col : undefined });
  return { canvas: dots, width: 28, margin: [0, 2.2, 0, 0] };
}

const SEAL = 66, SEAL_X = PAGE.w - PAGE.x - SEAL;
// the cover's thread: in from the page edge above the score, then down its right side. It ends in a dot
// on the score's baseline, or, for a Ready score, drops into the READY seal.
function threadSvg(x, top, end, dot) {
  const r = 20, h = end - top + 12;
  const d = `M0 6 H${(x - r).toFixed(1)} Q${x.toFixed(1)} 6 ${x.toFixed(1)} ${6 + r} V${(end - top + 6).toFixed(1)}`;
  const c = dot ? `<circle cx="${x.toFixed(1)}" cy="${(end - top + 6).toFixed(1)}" r="3.2" fill="${C.line}"/>` : '';
  return { svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${PAGE.w}" height="${h.toFixed(1)}" viewBox="0 0 ${PAGE.w} ${h.toFixed(1)}"><path d="${d}" stroke="${C.line}" stroke-width="1.3" fill="none"/>${c}</svg>`,
    width: PAGE.w, height: h, absolutePosition: { x: 0, y: top - 6 } };
}

function fmtDate(d) { return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); }

// ---------- the document ----------
export function reportDocDefinition({ code, name, business, date = new Date() }) {
  const decoded = decodeAnswers(String(code || '').replace(/^#/, ''));
  if (!decoded) throw new Error('incomplete answers code');
  const r = buildReport(decoded.answers, decoded.industry);
  const who = [printable(name), printable(business)].filter(Boolean).join(', ');
  const day = fmtDate(date);
  const ready = r.band.key === 'ready';

  // ----- cover (page 1): a fixed layout -----
  const NUM = 150, threadY = 404;
  const numTop = threadY + 50 - (SERIF_ASC - DIGIT_H) * NUM;        // digits start 50pt under the thread
  const base = numTop + SERIF_ASC * NUM;                             // the numeral's baseline
  const numX = PAGE.x - 5, numW = String(r.total).length * DIGIT_EM * NUM;
  const outX = numX + numW + 12;
  const thread = ready
    ? threadSvg(SEAL_X + SEAL / 2, threadY, base - SEAL, false)
    : threadSvg(outX + 4.285 * 12 + 30, threadY, base, true);
  const bandTop = base + 34;
  const cover = [
    { svg: WORDMARK_SVG, width: 128, height: 128 / WORDMARK_ASPECT, absolutePosition: { x: PAGE.x, y: 58 } },
    { ...eyebrow('Sale-readiness report'), absolutePosition: { x: PAGE.x, y: 180 } },
    { text: 'Your business, as a buyer would see it', font: 'Serif', fontSize: 38, lineHeight: LH.title, color: C.ink, absolutePosition: { x: PAGE.x, y: 198 }, width: 420 },
    { stack: [
      who ? { text: [{ text: 'Prepared for ', color: C.ink2 }, { text: who, font: 'SansMed', color: C.ink }], font: 'Sans', fontSize: 11, lineHeight: LH.tight } : null,
      { text: `${decoded.industry} · yearly revenue ${decoded.revenue.toLowerCase()}`, font: 'Sans', fontSize: 10.5, lineHeight: LH.tight, color: C.ink2, margin: [0, who ? 5 : 0, 0, 0] },
      { text: day, font: 'Sans', fontSize: 10.5, lineHeight: LH.tight, color: C.ink2, margin: [0, 2, 0, 0] },
    ].filter(Boolean), absolutePosition: { x: PAGE.x, y: 306 } },
    thread,
    { text: String(r.total), font: 'Serif', fontSize: NUM, lineHeight: 1, color: C.green, absolutePosition: { x: numX, y: numTop } },
    { text: 'out of 100', font: 'Sans', fontSize: 12, lineHeight: 1, color: C.ink2, absolutePosition: { x: outX, y: base - SANS_ASC * 12 } },
    { text: r.band.label, font: 'Serif', bold: true, fontSize: 28, lineHeight: 1, color: C.green, absolutePosition: { x: PAGE.x, y: bandTop } },
    { text: r.band.summary, font: 'Sans', fontSize: 12, lineHeight: LH.text, color: C.ink, absolutePosition: { x: PAGE.x, y: bandTop + 44 }, width: 392 },
    ready ? { canvas: [{ type: 'rect', x: 0, y: 0, w: SEAL, h: SEAL, r: 8, lineWidth: 1.1, lineColor: C.line }, { type: 'rect', x: 4, y: 4, w: SEAL - 8, h: SEAL - 8, r: 6, lineWidth: 0.6, lineColor: C.line }], absolutePosition: { x: SEAL_X, y: base - SEAL } } : null,
    ready ? { text: 'READY', font: 'SansMed', fontSize: 8.5, lineHeight: 1, characterSpacing: 1.6, color: C.green, absolutePosition: { x: SEAL_X + 13.5, y: base - SEAL / 2 - 6.2 } } : null,
  ].filter(Boolean);
  cover.push({ text: '', pageBreak: 'after' });

  // ----- at a glance: five areas + where to start -----
  const areaRows = AREAS.map((a) => {
    const pct = r.areas.find((x) => x.key === a.key).percent;
    return { columns: [
      { stack: [{ text: a.label, font: 'SansMed', fontSize: 11, lineHeight: LH.tight, color: C.ink }, { text: `${a.weight} of 100 points`, font: 'Sans', fontSize: 8.5, lineHeight: LH.tight, color: C.ink2, margin: [0, 1, 0, 0] }], width: 190 },
      { stack: [bar(pct, 220)], width: 220, margin: [0, 7, 0, 0] },
      { text: `${pct}%`, font: 'Serif', fontSize: 17, color: C.ink, alignment: 'right', width: '*' },
    ], columnGap: 14, margin: [0, 0, 0, 0] };
  });
  // where you stand: the four bands on a 0-100 scale, with the score marked
  const BANDS = [['Not ready yet', 0, 40], ['Needs work', 40, 65], ['Nearly ready', 65, 85], ['Ready', 85, 100]];
  const sx = (v) => CONTENT_W * v / 100;
  const scale = { stack: [
    { canvas: [
      { type: 'rect', x: 0, y: 14, w: CONTENT_W, h: 3, color: C.track },
      ...BANDS.filter(([label]) => label === r.band.label).map(([, a, b]) => ({ type: 'rect', x: sx(a), y: 14, w: sx(b) - sx(a), h: 3, color: C.green })),
      ...[40, 65, 85].map((v) => ({ type: 'line', x1: sx(v), y1: 9, x2: sx(v), y2: 22, lineWidth: 0.7, lineColor: C.ink2 })),
      { type: 'line', x1: sx(r.total), y1: 0, x2: sx(r.total), y2: 15, lineWidth: 1, lineColor: C.green },
      { type: 'ellipse', x: sx(r.total), y: 15.5, r1: 4.2, r2: 4.2, color: C.green },
    ] },
    { columns: BANDS.map(([label, a, b]) => ({ width: sx(b) - sx(a), stack: [
      { text: label, font: label === r.band.label ? 'SansMed' : 'Sans', fontSize: 9, lineHeight: LH.tight, color: label === r.band.label ? C.green : C.ink2 },
      { text: b === 100 ? `${a}+` : `${a}–${b - 1}`, font: 'Sans', fontSize: 8, lineHeight: LH.tight, color: C.ink2, margin: [0, 1, 0, 0] },
    ] })), columnGap: 0, margin: [0, 8, 0, 0] },
  ] };
  const glance = [
    h2('Where you stand'),
    body(`Your business scored ${r.total} out of 100: ${r.band.label.toLowerCase()}. ${r.band.summary}`, { color: C.ink2, margin: [0, 10, 0, 22] }),
    scale,
    h2('Your five areas', { margin: [0, 40, 0, 0] }),
    body('Each of your answers was scored as a buyer, or a buyer’s bank, would weigh it. Financial records count for 30 of the 100 points, dependence on you for 25, and customers, operations and your story for 15 each. The score measures how ready the business is to be sold. It says nothing about how good a business it is.', { color: C.ink2, margin: [0, 10, 0, 18] }),
    ...areaRows.flatMap((row, i) => [row, rule(10, 10)]),
  ];

  const actions = r.actions.length
    ? r.actions.map((a, i) => ({ unbreakable: true, columns: [
        { text: String(i + 1).padStart(2, '0'), font: 'Serif', fontSize: 20, color: C.green, width: 34 },
        { stack: [
          eyebrow(a.area),
          { text: a.title, font: 'Serif', fontSize: 15.5, lineHeight: LH.head, color: C.ink, margin: [0, 4, 0, 5] },
          body(a.fix, { fontSize: 10 }),
        ], width: '*' },
      ], columnGap: 8, margin: [0, 0, 0, 18] }))
    : [body('No gaps worth fixing first. That’s rare.')];
  const start = [
    { unbreakable: true, pageBreak: 'before', stack: [
      h2('Where to start'),
      body('The changes that would move your score, and a buyer’s opinion, the most. In order.', { color: C.ink2, margin: [0, 8, 0, 18] }),
      actions[0],
    ] },
    ...actions.slice(1),
  ];

  // ----- area by area -----
  const item = (it) => ({ unbreakable: true, stack: [
    { columns: [
      { text: it.text, font: 'SansMed', fontSize: 10.5, lineHeight: LH.tight, color: C.ink, width: '*' },
      { columns: [verdictMark(it.points), { text: it.verdict, font: 'SansMed', fontSize: 8.5, color: it.points === 3 ? C.green : C.ink, width: 'auto', margin: [0, 1, 0, 0] }], width: 110, columnGap: 4 },
    ], columnGap: 18 },
    { text: [{ text: 'You said: ', color: C.ink2 }, { text: it.answer, font: 'SansMed', color: C.ink }], font: 'Sans', fontSize: 9.5, lineHeight: LH.tight, margin: [0, 4, 0, 6] },
    body(it.why, { fontSize: 10, color: C.ink2 }),
    it.fix ? { text: [{ text: 'What to do. ', font: 'Sans', bold: true, color: C.green }, { text: it.fix }], font: 'Sans', fontSize: 10, lineHeight: LH.text, color: C.ink, margin: [0, 6, 0, 0] } : null,
    rule(14, 14),
  ].filter(Boolean) });

  const areas = [h2('Area by area', { pageBreak: 'before' }), body('Every answer you gave, what a buyer makes of it, and what to do. Weakest area first.', { color: C.ink2, margin: [0, 8, 0, 20] })];
  r.sections.forEach((s, si) => {
    const head = { stack: [
      { columns: [
        { text: s.label, font: 'Serif', bold: true, fontSize: 17, color: C.green, width: '*' },
        { text: `${s.percent}%`, font: 'Serif', fontSize: 17, color: C.ink, width: 'auto' },
      ] },
      { stack: [bar(s.percent, CONTENT_W, 3)], margin: [0, 7, 0, 9] },
      body(s.advice, { fontSize: 10, color: C.ink2, margin: [0, 0, 0, 14] }),
    ], margin: [0, si ? 22 : 0, 0, 0] };
    const [first, ...rest] = s.items;
    // keep each area's heading with its first question
    areas.push({ unbreakable: true, stack: [head, item(first)] }, ...rest.map(item));
  });

  // ----- what happens next -----
  const next = [
    h2('What happens next'),
    body('The next step is a free 45-minute call with one of us. We’ll go through this report with you, answer your questions, and give you an indicative range for what the business could be worth today and what it could be worth with these gaps closed. There is no obligation, and everything stays between us.', { margin: [0, 12, 0, 18] }),
    { table: { widths: ['*'], body: [[{ stack: [
      { text: 'Book your free review', font: 'Serif', bold: true, fontSize: 16, color: C.green },
      { text: ['Reply to the email this report came with, or write to ', { text: 'contact@handoveradvisors.com', link: 'mailto:contact@handoveradvisors.com?subject=My%20readiness%20review', color: C.green, decoration: 'underline', decorationColor: C.line }, '.'], font: 'Sans', fontSize: 10.5, lineHeight: LH.text, color: C.ink, margin: [0, 5, 0, 0] },
    ], margin: [16, 14, 16, 14] }]] }, layout: { hLineWidth: () => 1, vLineWidth: () => 1, hLineColor: () => C.line, vLineColor: () => C.line } },
    { text: 'If you’d like help after that', font: 'Serif', bold: true, fontSize: 15, color: C.green, margin: [0, 26, 0, 8] },
    body('Our Sale-Ready Package does the work. We recast your financials, analyze your customers, prepare the buyer materials and organize your documents. If we find changes worth making before you list, we can help you make them. It is a fixed fee, from $5,000, $10,000 or $15,000 depending on the size of the business. We take no percentage of your sale.'),
    { text: 'Who we are', font: 'Serif', bold: true, fontSize: 15, color: C.green, margin: [0, 24, 0, 8] },
    body('Handover is Dimitri and Zach. We work with a small number of owners at a time, and you deal with us directly. We work alongside your accountant, lawyer and broker; we don’t replace them. We sign an NDA with every client before kick-off.'),
    rule(28, 12),
    { text: 'This report is based only on the answers you gave, which we have not checked. Any value range we discuss is indicative and is not a formal valuation. Handover is not a business broker, appraiser, or tax or legal adviser. Everything you share with us is confidential: we never contact your staff, customers or suppliers.', font: 'Sans', fontSize: 8, lineHeight: LH.text, color: C.ink2 },
  ];

  return {
    pageSize: 'LETTER',
    pageMargins: [PAGE.x, 62, PAGE.x, 70],
    info: { title: 'Your sale-readiness report', author: 'Handover', subject: 'Sale-readiness report', creator: 'handoveradvisors.com' },
    defaultStyle: { font: 'Sans', fontSize: 10.5, color: C.ink },
    footer: (page, pages) => page === 1 ? ({
      text: ['Prepared by Handover  ·  ', { text: 'handoveradvisors.com', link: 'https://handoveradvisors.com' }, '  ·  Confidential'], font: 'Sans', fontSize: 8, color: C.ink2, margin: [PAGE.x, 30, PAGE.x, 0],
    }) : ({
      columns: [
        { text: 'Handover  ·  Sale-readiness report', font: 'Sans', fontSize: 7.5, color: C.ink2 },
        { text: `${page} / ${pages}`, font: 'Sans', fontSize: 7.5, color: C.ink2, alignment: 'right', width: 60 },
      ],
      margin: [PAGE.x, 30, PAGE.x, 0],
    }),
    // "What happens next" follows the last question when the whole section fits on that page, otherwise it starts the next one
    content: [...cover, ...glance, ...start, ...areas, { unbreakable: true, stack: next, margin: [0, 34, 0, 0] }],
  };
}

// Load pdfmake and the fonts ahead of time (the score page does this while the owner types their details).
export function preloadReportPdf() { return load(); }

export async function reportPdf({ code, name, business, date } = {}) {
  const dd = reportDocDefinition({ code, name, business, date });
  const pdfMake = await load();
  // Lay the document out once: pdfmake rewrites the definition as it lays it out, so a second pass
  // (say getBase64 and then getBlob) would draw every line and bar in the wrong place.
  const buffer = await new Promise((res) => pdfMake.createPdf(dd).getBuffer(res));
  const bytes = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  return { base64: toBase64(bytes), blob: new Blob([bytes], { type: 'application/pdf' }), filename: FILENAME };
}

export async function downloadReportPdf({ code, name, business } = {}) {
  const { blob, filename } = await reportPdf({ code, name, business });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
