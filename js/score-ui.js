import { AREAS, QUESTIONS, PROFILE_QUESTIONS } from './questions.js';
import { score } from './scoring.js';
import { encodeAnswers } from './report.js';
import { FORM_ENDPOINT } from './config.js';

const $ = (id) => document.getElementById(id);
const areaLabel = Object.fromEntries(AREAS.map((a) => [a.key, a.label]));

// One flat list of screens: profile questions first, then the scored ones.
const screens = [
  ...PROFILE_QUESTIONS.map((p) => ({
    id: p.id, eyebrow: 'About the business', text: p.text, labels: p.options,
  })),
  ...QUESTIONS.map((q) => ({
    id: q.id, eyebrow: areaLabel[q.area], text: q.text, labels: q.options.map((o) => o.label),
  })),
];

// The docked question sits just below the docked header, whatever its height.
const setHeadHeight = () => document.documentElement.style.setProperty('--head-h', `${document.querySelector('.site-head').offsetHeight}px`);
setHeadHeight();
window.addEventListener('resize', setHeadHeight);

const chosen = {}; // screen id -> option index. Held in memory only.
let at = 0;
let result = null;

function show(view) {
  for (const id of ['intro', 'quiz', 'details', 'result']) $(id).hidden = id !== view;
  window.scrollTo(0, 0);
}

function renderQuestion() {
  const s = screens[at];
  $('q-area').textContent = s.eyebrow;
  $('q-count').textContent = `${at + 1} of ${screens.length}`;
  const pct = Math.round((at / screens.length) * 100);
  $('q-bar').style.width = `${pct}%`;
  $('q-bar').parentElement.setAttribute('aria-valuenow', String(pct));
  $('q-text').textContent = s.text;
  $('q-count2').textContent = `${at + 1} of ${screens.length}`;

  const box = $('q-options');
  box.replaceChildren();
  s.labels.forEach((text, i) => {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'answer';
    input.value = String(i);
    input.checked = chosen[s.id] === i;
    input.addEventListener('change', () => {
      chosen[s.id] = i;
      $('next').disabled = false;
    });
    const span = document.createElement('span');
    span.textContent = text;
    label.append(input, span);
    box.append(label);
  });

  $('next').disabled = !(s.id in chosen);
  $('next').textContent = at === screens.length - 1 ? 'See my score' : 'Next';
  $('back').textContent = at === 0 ? 'Cancel' : 'Back';
  $('q-text').focus();
}

let leadSent = null; // promise for the background send

function renderResult() {
  const answers = Object.fromEntries(QUESTIONS.map((q) => [q.id, chosen[q.id]]));
  result = score(answers);

  const total = $('r-total');
  total.replaceChildren(String(result.total));
  const small = document.createElement('small');
  small.textContent = 'out of 100';
  total.append(small);
  $('r-band').textContent = result.band.label;
  $('r-summary').textContent = result.band.summary;

  $('r-bars').replaceChildren(...result.areas.map((a) => {
    const li = document.createElement('li');
    const name = document.createElement('span');
    name.textContent = a.label;
    const track = document.createElement('span');
    track.className = 'bars__track';
    const fill = document.createElement('span');
    fill.className = 'bars__fill';
    fill.style.width = `${a.percent}%`;
    track.append(fill);
    const pct = document.createElement('span');
    pct.className = 'bars__pct';
    pct.textContent = `${a.percent}%`;
    li.append(name, track, pct);
    return li;
  }));

  const gaps = $('r-gaps');
  if (result.gaps.length === 0) {
    const p = document.createElement('p');
    p.textContent = 'No weak areas. That’s rare.';
    gaps.replaceChildren(p);
  } else {
    gaps.replaceChildren(...result.gaps.map((g) => {
      const li = document.createElement('li');
      const h = document.createElement('h3');
      h.textContent = g.label;
      const p = document.createElement('p');
      p.textContent = g.advice;
      li.append(h, p);
      return li;
    }));
  }

  $('open-report').href = reportLink();
  show('result');
  total.focus();
}

$('start').addEventListener('click', () => { at = 0; show('quiz'); renderQuestion(); });

$('back').addEventListener('click', () => {
  if (at === 0) { show('intro'); return; }
  at -= 1;
  renderQuestion();
});

$('q-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!(screens[at].id in chosen)) return;
  if (at === screens.length - 1) { show('details'); $('d-title').focus(); return; }
  at += 1;
  renderQuestion();
});

$('d-back').addEventListener('click', () => { show('quiz'); renderQuestion(); });

function reportLink() {
  return new URL(`report.html#${encodeAnswers(chosen)}`, location.href).href;
}

// Flat, readable fields: this is what lands in our inbox and in the sheet.
function payload(form) {
  const data = new FormData(form);
  const profile = (id) => PROFILE_QUESTIONS.find((p) => p.id === id).options[chosen[id]];
  const name = data.get('name').trim();
  const fields = {
    _subject: `Readiness score ${result.total}: ${name} (${profile('industry')})`,
    Name: name,
    Email: data.get('email').trim(),
    Phone: data.get('phone').trim() || 'Not given',
    Business: data.get('business').trim() || 'Not given',
    Industry: profile('industry'),
    Revenue: profile('revenue'),
    Score: `${result.total} out of 100 (${result.band.label})`,
    'Biggest gaps': result.gaps.map((g) => g.label).join(', ') || 'None',
    'Full report': reportLink(),
  };
  for (const a of result.areas) fields[`Area: ${a.label}`] = `${a.percent}%`;
  for (const q of QUESTIONS) fields[q.text] = q.options[chosen[q.id]].label;
  return fields;
}

function sendLead(fields) {
  if (!FORM_ENDPOINT) return Promise.reject(new Error('not configured'));
  // A Google Apps Script endpoint only accepts a "simple" request, so the JSON goes as plain text.
  const google = FORM_ENDPOINT.includes('script.google.com');
  return fetch(FORM_ENDPOINT, {
    method: 'POST',
    headers: google
      ? { 'Content-Type': 'text/plain;charset=utf-8' }
      : { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(fields),
  }).then(async (res) => {
    if (!res.ok) throw new Error(String(res.status));
    if (google && !(await res.json()).ok) throw new Error('rejected');
  });
}

$('lead').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  if (form.elements.website.value) return; // honeypot
  if (!form.reportValidity()) return;

  renderResult();
  const fields = payload(form);
  const email = fields.Email;
  $('sent-text').textContent = `We’re sending it to ${email}. Give it a few minutes, and check your spam folder if it doesn’t arrive.`;

  leadSent = sendLead(fields).then(() => {
    $('sent-text').textContent = `We’ve sent it to ${email}. If it doesn’t arrive within a few minutes, check your spam folder.`;
  }).catch(() => {
    $('sent-title').textContent = 'We couldn’t send your report automatically';
    $('sent-text').textContent = `Open it with the button below, and email contact@handoveradvisors.com if you’d like a copy sent to ${email}.`;
    $('sent').classList.add('sent--failed');
  });
});
