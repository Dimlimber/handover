import { decodeAnswers, buildReport } from './report.js';

const $ = (id) => document.getElementById(id);
const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
};

const decoded = decodeAnswers(location.hash.slice(1));

if (!decoded) {
  $('missing').hidden = false;
} else {
  const report = buildReport(decoded.answers);

  $('rep-date').textContent = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  $('rep-profile').textContent = `${decoded.industry} · yearly revenue ${decoded.revenue.toLowerCase()}`;

  $('r-total').append(String(report.total), el('small', null, 'out of 100'));
  $('r-band').textContent = report.band.label;
  $('r-summary').textContent = report.band.summary;

  $('r-bars').append(...report.areas.map((a) => {
    const li = el('li');
    const track = el('span', 'bars__track');
    const fill = el('span', 'bars__fill');
    fill.style.width = `${a.percent}%`;
    track.append(fill);
    li.append(el('span', null, a.label), track, el('span', 'bars__pct', `${a.percent}%`));
    return li;
  }));

  if (report.actions.length === 0) {
    $('rep-actions-block').hidden = true;
  } else {
    $('rep-actions').append(...report.actions.map((a) => {
      const li = el('li');
      li.append(el('p', 'eyebrow', a.area), el('h3', null, a.title), el('p', null, a.fix));
      return li;
    }));
  }

  $('rep-sections').append(...report.sections.map((s) => {
    const section = el('section', 'rep-area');
    const head = el('div', 'rep-area__head');
    head.append(el('h3', null, s.label), el('span', 'rep-area__pct', `${s.percent}%`));
    section.append(head, el('p', 'rep-area__advice', s.advice));

    for (const item of s.items) {
      const row = el('div', 'rep-item');
      const q = el('div', 'rep-item__q');
      q.append(el('p', 'rep-item__text', item.text));
      const answer = el('p', 'rep-item__answer');
      answer.append('You said: ', el('strong', null, item.answer));
      q.append(answer);
      const verdict = el('span', `verdict verdict--${item.points}`, item.verdict);
      const body = el('div', 'rep-item__body');
      body.append(el('p', null, item.why));
      if (item.fix) {
        const fix = el('p', 'rep-item__fix');
        fix.append(el('strong', null, 'What to do. '), item.fix);
        body.append(fix);
      }
      row.append(q, verdict, body);
      section.append(row);
    }
    return section;
  }));

  $('rep-print').addEventListener('click', () => window.print());
  $('report').hidden = false;
}
