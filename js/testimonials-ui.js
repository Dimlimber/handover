import { TESTIMONIALS, SAMPLES, SHOW_SAMPLES_FOR_REVIEW } from './testimonials.js';

// Samples are always stamped as samples. Real testimonials, once added, replace them.
const preview = new URLSearchParams(location.search).get('preview') === 'testimonials'
  || (SHOW_SAMPLES_FOR_REVIEW && TESTIMONIALS.length === 0);
const items = preview ? SAMPLES : TESTIMONIALS;

if (items.length) {
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };

  document.getElementById('quotes').append(...items.map((t) => {
    const figure = el('figure', 'quote');
    if (preview) {
      figure.setAttribute('data-nosnippet', ''); // keep samples out of search results
      figure.append(el('p', 'quote__sample', 'Sample only. Not a real testimonial.'));
    }
    figure.append(el('blockquote', null, t.quote));
    const caption = el('figcaption');
    caption.append(el('strong', null, t.name), el('span', null, [t.role, t.business].filter(Boolean).join(' · ')));
    if (t.context) caption.append(el('span', 'quote__context', t.context));
    if (t.result) caption.append(el('span', 'quote__result', t.result));
    figure.append(caption);
    return figure;
  }));

  document.getElementById('testimonials').hidden = false;
  // Keep the section numbers in order now that one more is showing.
  document.querySelectorAll('main .section:not([hidden]) .section__label b')
    .forEach((b, i) => { b.textContent = String(i + 1).padStart(2, '0'); });
}
