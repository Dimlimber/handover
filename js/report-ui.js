// The owner's report, drawn from the answers in the link (industry-revenue-14 digits; no personal details).
import { decodeAnswers, buildReport } from './report.js';

const d = document, de = d.documentElement, win = window;
const $ = (id) => d.getElementById(id);
const el = (tag, className, text) => {
  const node = d.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
};
const two = (n) => String(n).padStart(2, '0');

const decoded = decodeAnswers(location.hash.slice(1));

if (!decoded) {
  $('missing').hidden = false;
  $('thread').style.display = 'none';
  const nav = $('nav');
  const onScroll = () => nav.classList.toggle('scrolled', win.pageYOffset > 8);
  win.addEventListener('scroll', onScroll, { passive: true }); onScroll();
} else {
  const report = buildReport(decoded.answers, decoded.industry);

  $('rep-date').textContent = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  $('rep-profile').textContent = `${decoded.industry} · yearly revenue ${decoded.revenue.toLowerCase()}`;

  $('r-total').textContent = String(report.total);
  $('r-band').textContent = report.band.label;
  $('r-summary').textContent = report.band.summary;

  $('r-bars').append(...report.areas.map((a) => {
    const li = el('li');
    const track = el('span', 'b-t');
    track.setAttribute('aria-hidden', 'true');
    const fill = el('span', 'b-f');
    fill.style.width = `${a.percent}%`;
    track.append(fill);
    li.append(el('span', 'b-l', a.label), track, el('span', 'b-p', `${a.percent}%`));
    return li;
  }));

  if (report.actions.length === 0) {
    $('rep-actions-block').hidden = true;
  } else {
    $('rep-actions').append(...report.actions.map((a, i) => {
      const li = el('li', 'act');
      const n = el('span', 'act-n', two(i + 1));
      n.setAttribute('aria-hidden', 'true');
      const body = el('div');
      body.append(el('p', 'act-area', a.area), el('h3', 'act-t', a.title), el('p', 'act-fix', a.fix));
      li.append(n, body);
      return li;
    }));
  }

  $('rep-sections').append(...report.sections.map((s) => {
    const section = el('section', 'area');
    const head = el('div', 'area-head');
    const h = el('h3', 'area-h', s.label);
    h.id = `area-${s.key}`;
    h.setAttribute('data-tick', '');
    section.setAttribute('aria-labelledby', h.id);
    head.append(h, el('span', 'area-p', `${s.percent}%`));
    // the heading, its advice and the first question stay together (on paper too)
    const top = el('div', 'area-top');
    top.append(head, el('p', 'area-adv', s.advice));
    section.append(top);

    s.items.forEach((item, n) => {
      const row = el('div', 'item');
      const q = el('div', 'item-q');
      q.append(el('p', 'item-text', item.text));
      const answer = el('p', 'item-ans');
      answer.append('You said: ', el('strong', null, item.answer));
      q.append(answer);
      // the verdict: one filled marker per point the answer earns (of three); only Strong is green
      const verdict = el('p', `verdict v${item.points}`);
      const marks = el('span', 'vm');
      marks.setAttribute('aria-hidden', 'true');
      for (let k = 0; k < 3; k++) marks.append(el('i', k < item.points ? 'on' : null));
      verdict.append(marks, item.verdict);
      q.append(verdict);
      const body = el('div', 'item-b');
      body.append(el('p', null, item.why));
      if (item.fix) {
        const fix = el('p', 'item-fix');
        fix.append(el('strong', null, 'What to do.'), ' ', item.fix);
        body.append(fix);
      }
      row.append(q, body);
      (n === 0 ? top : section).append(row);
    });
    return section;
  }));

  $('report').hidden = false;
  wirePdf();
  splitWords($('repH'));
  setTimeout(() => $('repH').classList.add('in'), 150);
  drawThread();
}
win.__threadOK = true;

/* ---------- the PDF: both buttons share one job; the generator is loaded only when asked for ---------- */
function wirePdf() {
  const buttons = [$('rep-pdf'), $('rep-pdf-2')];
  const notes = { 'rep-pdf': $('rep-pdf-note'), 'rep-pdf-2': $('rep-pdf-note-2') };
  const LABEL = 'Download PDF', BUSY = 'Preparing your PDF…';
  let busy = false;
  const set = (on) => buttons.forEach((b) => {
    b.disabled = on;
    b.querySelector('span').textContent = on ? BUSY : LABEL;
    if (on) b.setAttribute('aria-busy', 'true'); else b.removeAttribute('aria-busy');
  });
  buttons.forEach((btn) => btn.addEventListener('click', async () => {
    if (busy) return;
    busy = true;
    const hadFocus = d.activeElement === btn;
    Object.values(notes).forEach((n) => { n.hidden = true; n.textContent = ''; });
    set(true);
    try {
      const m = await import('./report-pdf.js');
      await m.downloadReportPdf({ code: location.hash.slice(1) });
    } catch (err) {
      const note = notes[btn.id];
      note.textContent = 'Sorry, the PDF could not be made. Please try again, or print this page.';
      note.hidden = false;
    } finally {
      set(false);
      busy = false;
      if (hadFocus && (d.activeElement === d.body || !d.activeElement)) btn.focus();
    }
  }));
}

/* ---------- the title arrives word by word (a static blurred twin fades out; only opacity and transform move) ---------- */
function splitWords(h) {
  const words = h.textContent.trim().split(/\s+/);
  h.textContent = '';
  words.forEach((w, i) => {
    if (i) h.append(' ');
    const o = el('span', 'w');
    o.style.setProperty('--i', i);
    const b = el('span', 'w-b', w);
    b.setAttribute('aria-hidden', 'true');
    o.append(b, el('span', 'w-s', w));
    h.append(o);
  });
}

/* ---------- the thread: in from the left edge under the title, down the gutter past every heading, green into the review button ---------- */
function drawThread() {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = $('thread'), nav = $('nav'), body = d.body;
  const mqRM = win.matchMedia('(prefers-reduced-motion: reduce)');
  let rm = mqRM.matches;
  const HEAD = 0.68, K = 0.5523, INTRO = 1500;
  const c01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const eio = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  // layout boxes through offsetParent, so transforms never skew the route
  const R = (node) => { let l = 0, t = 0, e = node; while (e) { l += e.offsetLeft; t += e.offsetTop; e = e.offsetParent; } return { l, t, r: l + node.offsetWidth, b: t + node.offsetHeight, w: node.offsetWidth, h: node.offsetHeight }; };
  const seg = (p, x, y) => { const s = p[p.length - 1], n = Math.max(1, Math.ceil(Math.hypot(x - s[0], y - s[1]) / 24)); for (let i = 1; i <= n; i++) { const t = i / n; p.push([s[0] + (x - s[0]) * t, s[1] + (y - s[1]) * t]); } };
  const cub = (p, x1, y1, x2, y2, x, y) => { const s = p[p.length - 1], est = Math.hypot(x1 - s[0], y1 - s[1]) + Math.hypot(x2 - x1, y2 - y1) + Math.hypot(x - x2, y - y2), n = Math.max(8, Math.ceil(est / 4)); for (let i = 1; i <= n; i++) { const t = i / n, m = 1 - t; p.push([m * m * m * s[0] + 3 * m * m * t * x1 + 3 * m * t * t * x2 + t * t * t * x, m * m * m * s[1] + 3 * m * m * t * y1 + 3 * m * t * t * y2 + t * t * t * y]); } };
  const lens = (p) => { const ls = [0]; let L = 0; for (let i = 1; i < p.length; i++) { L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); ls.push(L); } return ls; };
  const mk = (tag, cls, parent) => { const e = d.createElementNS(NS, tag); if (cls) e.setAttribute('class', cls); (parent || svg).appendChild(e); return e; };
  const ticksG = mk('g');
  const PI = { el: mk('path', 't-ink') }, PG = { el: mk('path', 't-green') };
  const needle = mk('circle', 'needle');
  needle.setAttribute('r', '3.4'); needle.setAttribute('cx', '0'); needle.setAttribute('cy', '0'); needle.style.opacity = '0';
  const cta = $('rep-book'), headLine = $('headLine'), profile = $('rep-profile');
  const ticks = [...d.querySelectorAll('[data-tick]')].map((node) => ({ node, tk: mk('path', 't-tick', ticksG), y: 0, on: null }));

  let VW = 0, VH = 0, mob = false, X = 0, yL = 0, yTop = 0, yHook = 0, xEnd = 0, maxScroll = 0, G = {}, layoutOK = false, dirty = true;
  function measure() {
    VW = de.clientWidth; VH = win.innerHeight; mob = VW < 760;
    G = mob ? { t1: 9, r: 0, rh: 16, gb: 10 } : { t1: 12, r: 34, rh: 28, gb: 14 };
    const g = profile.parentNode, gs = getComputedStyle(g), gap = parseFloat(gs.columnGap) || 0;
    const cw = (g.clientWidth - parseFloat(gs.paddingLeft) - parseFloat(gs.paddingRight) - 11 * gap) / 12;
    X = mob ? 20 : Math.round(R(profile).l - gap - cw / 2);
    yTop = nav.offsetHeight + 14;
    yL = Math.round(R(headLine).t);
    ticks.forEach((t) => { const r = R(t.node), lh = parseFloat(getComputedStyle(t.node).lineHeight) || r.h; t.y = Math.round(r.t + Math.min(lh, r.h) / 2); });
    const c = R(cta); yHook = Math.round(c.t + c.h / 2); xEnd = Math.round(c.l - G.gb);
    maxScroll = Math.max(0, de.scrollHeight - VH);
  }
  function setPath(o, pts, ar) {
    let s = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1), L = 0; const ls = new Float64Array(pts.length);
    for (let i = 1; i < pts.length; i++) { s += 'L' + pts[i][0].toFixed(1) + ' ' + pts[i][1].toFixed(1); L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); ls[i] = L; }
    for (let i = 1; i < ar.length; i++) if (ar[i] < ar[i - 1] + 1e-3) ar[i] = ar[i - 1] + 1e-3;
    Object.assign(o, { pts, ls, L, ar, cur: -1 });
    o.el.setAttribute('d', s); o.el.style.strokeDasharray = (L + 1).toFixed(1) + ' ' + (L + 4).toFixed(1);
  }
  // each point carries the head position (document y) at which it is drawn: the descent draws with the page,
  // the entrance is spread over the height it turns through, the hook over part of its length
  function build() {
    const p = [], ar = [], r = G.r;
    if (mob) { p.push([X, yTop]); ar.push(yTop); }
    else { p.push([0, yL]); seg(p, X - r, yL); cub(p, X - r + K * r, yL, X, yL + r - K * r, X, yL + r); const ls = lens(p); for (let i = 0; i < p.length; i++) ar.push(yL + r - (ls[ls.length - 1] - ls[i])); }
    const n1 = p.length; seg(p, X, yHook - G.rh); for (let j = n1; j < p.length; j++) ar.push(p[j][1]);
    setPath(PI, p, ar);
    ticks.forEach((t) => t.tk.setAttribute('d', 'M' + (X - G.t1) + ' ' + t.y + 'H' + X));
    const rh = G.rh, g = [[X, yHook - rh]]; cub(g, X, yHook - rh + K * rh, X + rh - K * rh, yHook, X + rh, yHook); if (xEnd > X + rh + 1) seg(g, xEnd, yHook);
    const gl = lens(g), GL = gl[gl.length - 1], a0 = yHook - rh, top = maxScroll + HEAD * VH - 6, k = Math.min(0.6, Math.max(0.05, (top - a0) / GL));
    setPath(PG, g, gl.map((v) => a0 + k * v));
    const H = body.offsetHeight; svg.setAttribute('height', H); svg.style.height = H + 'px';
    layoutOK = true; dirty = false;
  }
  const bs = (a, v) => { let lo = 0, hi = a.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (a[m] <= v) lo = m; else hi = m; } return lo; };
  const drawnFor = (o, H) => { const a = o.ar, n = a.length; if (!n || H <= a[0]) return 0; if (H >= a[n - 1]) return o.L; const i = bs(a, H); return o.ls[i] + (H - a[i]) / (a[i + 1] - a[i]) * (o.ls[i + 1] - o.ls[i]); };
  const pointAt = (o, len) => { const ls = o.ls, n = ls.length; if (len <= 0) return o.pts[0]; if (len >= o.L) return o.pts[n - 1]; const i = bs(ls, len), t = (len - ls[i]) / ((ls[i + 1] - ls[i]) || 1), a = o.pts[i], b = o.pts[i + 1]; return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; };
  const rho = (H) => { let m = 1; for (const o of [PI, PG]) { const a = o.ar, n = a ? a.length : 0; if (n < 2 || H <= a[0] || H >= a[n - 1]) continue; const i = bs(a, H), da = a[i + 1] - a[i]; if (da > 1e-6) m = Math.max(m, (o.ls[i + 1] - o.ls[i]) / da); } return m; };
  const setDraw = (o, len) => { if (Math.abs(len - o.cur) < 0.15) return; o.cur = len; o.el.style.strokeDashoffset = (len < 0.05 ? o.L + 3 : o.L + 1 - len).toFixed(2); };

  // one head, one dot at it
  let Hs = -1e9, T0 = 0, introDone = rm, lastNow = 0, dotOn = false, dotGreen = false, raf = 0;
  const kick = () => { if (!raf) raf = win.requestAnimationFrame(frame); };
  function render(now, dt, sy) {
    nav.classList.toggle('scrolled', sy > 8);
    let more = false, T = sy + HEAD * VH;
    if (sy >= maxScroll - 2) T = Math.max(T, PG.ar[PG.ar.length - 1] + 1);
    if (rm) Hs = 1e9;
    else {
      if (!introDone) { if (!T0) T0 = now; const ip = c01((now - T0 - 200) / INTRO), a0 = PI.ar[0]; T = a0 + (T - a0) * eio(ip); if (ip >= 1) introDone = true; more = true; }
      if (Hs < -1e8) Hs = PI.ar[0];
      const vT = sy - 80, vB = sy + VH + 80;
      if ((Hs > vB && T > vB) || (Hs < vT && T < vT)) Hs = T; else if (Hs > vB) Hs = vB; else if (Hs < vT) Hs = vT;
      const dH = T - Hs;
      if (Math.abs(dH) < 0.3) Hs = T;
      else {
        let st = dH * (1 - Math.pow(0.84, dt / 16.667)), cap = Math.max(16, 0.04 * VH) * Math.min(1.25, dt / 16.667);
        cap /= Math.max(rho(Hs), rho(Hs + (st > 0 ? Math.min(st, cap) : Math.max(st, -cap))));
        if (st > cap) st = cap; else if (st < -cap) st = -cap;
        Hs += st; more = true;
      }
    }
    const dI = drawnFor(PI, Hs), dG = drawnFor(PG, Hs);
    setDraw(PI, dI); setDraw(PG, dG);
    let np = null, green = false;
    if (!rm) { if (dG > 0.3) { np = pointAt(PG, dG); green = true; } else if (dI > 0.3) np = pointAt(PI, dI); }
    if (!np) { if (dotOn) { dotOn = false; needle.style.opacity = '0'; } }
    else {
      if (!dotOn) { dotOn = true; needle.style.opacity = '1'; }
      needle.style.transform = 'translate(' + np[0].toFixed(1) + 'px,' + np[1].toFixed(1) + 'px)';
      if (green !== dotGreen) { dotGreen = green; needle.classList.toggle('green', green); }
    }
    for (const t of ticks) { const on = Hs >= t.y - 1; if (on !== t.on) { t.on = on; t.tk.classList.toggle('on', on); } }
    return more;
  }
  function frame(now) {
    raf = 0;
    const dt = lastNow ? Math.min(50, Math.max(1, now - lastNow)) : 16.667; lastNow = now;
    const sy = win.pageYOffset;
    if (dirty) { measure(); build(); }
    if (!layoutOK) return;
    if (render(now, dt, sy)) kick(); else lastNow = 0;
  }

  let rT = 0, lastW = de.clientWidth;
  const relayout = () => { dirty = true; kick(); };
  win.addEventListener('scroll', kick, { passive: true });
  win.addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(() => { if (de.clientWidth !== lastW || !mob) { lastW = de.clientWidth; relayout(); } else { VH = win.innerHeight; maxScroll = Math.max(0, de.scrollHeight - VH); kick(); } }, 140); }, { passive: true });
  const onRM = () => { rm = mqRM.matches; if (rm) introDone = true; else dotOn = false; relayout(); };
  if (mqRM.addEventListener) mqRM.addEventListener('change', onRM); else if (mqRM.addListener) mqRM.addListener(onRM);
  measure(); build();
  // web fonts land after this script has run: re-measure when they do
  if (d.fonts && d.fonts.addEventListener) d.fonts.addEventListener('loadingdone', relayout);
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(relayout);
  win.addEventListener('load', relayout);
  if ('ResizeObserver' in win) { let lastH = 0; new ResizeObserver(() => { const h = body.offsetHeight; if (Math.abs(h - lastH) > 2) { lastH = h; clearTimeout(rT); rT = setTimeout(relayout, 120); } }).observe(body); }
  kick();
}
