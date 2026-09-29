/* Handover: measurement, and where each visitor came from.
   Loaded at the top of the <head> on every page.

   - Google Analytics 4 and Google Ads share one gtag.js. An empty ID switches that tag off.
   - There is no consent banner. Visitors in the EEA, the UK and Switzerland get Google's
     consent mode with everything denied (cookieless pings only); everyone else is measured
     with cookies. Ad personalization (remarketing) is off everywhere.
   - The first and the latest outside source of a visit (an ad click, utm tags, an outreach
     ref code or the referring site) are kept in this browser for 90 days, so a lead can be
     matched to the ad or email that brought it. window.hvSource() returns them as the plain
     fields the score form sends with each lead.
   - Clicks to email, call or book a call are counted as contact_click. Pages send their own
     events with window.hvTrack(name, params).
   - Pages are measured without their #fragment, so the private report's answers never leave
     the browser. */
(function (w, d) {
  'use strict';

  var GA4_ID = '';        // Google Analytics 4 measurement ID, like 'G-ABC123DEF4'
  var ADS_ID = '';        // Google Ads tag ID, like 'AW-123456789'
  var ADS_LABELS = {      // Google Ads conversion labels, from Goals > Conversions > (action) > Tag setup
    generate_lead: '',    // a completed readiness score: name and email given
    contact_click: '',    // a click to email, call or book a call
  };

  var CONSENT_REGIONS = ['AT', 'BE', 'BG', 'CH', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GB',
    'GR', 'HR', 'HU', 'IE', 'IS', 'IT', 'LI', 'LT', 'LU', 'LV', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO',
    'SE', 'SI', 'SK'];

  w.dataLayer = w.dataLayer || [];
  var gtag = w.gtag = w.gtag || function () { w.dataLayer.push(arguments); };
  gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
    analytics_storage: 'denied', region: CONSENT_REGIONS });
  gtag('consent', 'default', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'denied',
    analytics_storage: 'granted' });
  gtag('set', 'ads_data_redaction', true);

  var loc = w.location, here = loc.origin + loc.pathname + loc.search;
  var tagId = GA4_ID || ADS_ID;
  if (tagId) {
    var s = d.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + tagId;
    (d.head || d.documentElement).appendChild(s);
    gtag('js', new Date());
    if (GA4_ID) gtag('config', GA4_ID, { page_location: here, allow_google_signals: false, allow_ad_personalization_signals: false });
    if (ADS_ID) gtag('config', ADS_ID, { page_location: here, allow_ad_personalization_signals: false });
  }

  w.hvTrack = function (name, params) {
    gtag('event', name, params || {});
    var label = ADS_ID && ADS_LABELS[name];
    if (label) gtag('event', 'conversion', { send_to: ADS_ID + '/' + label });
  };

  /* ---------- where the visitor came from ---------- */
  var KEY = 'hv_src', KEEP = 90 * 864e5;
  var TAGS = ['gclid', 'gbraid', 'wbraid', 'msclkid', 'utm_source', 'utm_medium', 'utm_campaign',
    'utm_term', 'utm_content', 'ref'];
  function load() {
    try {
      var v = JSON.parse(w.localStorage.getItem(KEY) || 'null');
      return v && v.first && Date.now() - v.t < KEEP ? v : null;
    } catch (e) { return null; }
  }
  function keep(v) { try { w.localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }

  var tags = {}, tagged = false, from = '';
  try {
    var q = new URLSearchParams(loc.search);
    TAGS.forEach(function (k) { var v = q.get(k); if (v) { tags[k] = v.slice(0, 150); tagged = true; } });
  } catch (e) {}
  try { if (d.referrer) { var r = new URL(d.referrer); if (r.hostname !== loc.hostname) from = r.hostname; } } catch (e) {}
  var visit = { at: new Date().toISOString(), page: loc.pathname, from: from, tags: tags };
  var src = load();
  if (!src) keep({ t: Date.now(), first: visit, last: visit });
  else if (tagged || from) { src.last = visit; src.t = Date.now(); keep(src); }

  function describe(v) {
    if (!v) return '';
    var t = v.tags || {};
    if (t.gclid || t.gbraid || t.wbraid) return 'Google Ads';
    if (t.msclkid) return 'Microsoft Ads';
    if (t.utm_source) return t.utm_source + (t.utm_medium ? ' / ' + t.utm_medium : '');
    if (t.ref) return 'Link with ref ' + t.ref;
    return v.from || 'Direct';
  }
  w.hvSource = function () {
    var st = load() || { first: visit, last: visit };
    var l = st.last, f = st.first, t = l.tags || {};
    return {
      'Came from': describe(l),
      Campaign: t.utm_campaign || '',
      Keyword: t.utm_term || '',
      Ad: t.utm_content || '',
      'Landing page': l.page || '',
      'First came from': describe(f) + ' (' + String(f.at || '').slice(0, 10) + ', ' + (f.page || '') + ')',
      'Ad click ID': t.gclid || t.gbraid || t.wbraid || t.msclkid || '',
    };
  };

  /* ---------- clicks to email, call or book ---------- */
  d.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var h = a.getAttribute('href') || '';
    var how = /^mailto:/i.test(h) ? 'email' : /^tel:/i.test(h) ? 'phone'
      : /calendar\.app\.google|calendar\.google\.com\/calendar\/.*appointments/i.test(h) ? 'booking' : '';
    if (how) w.hvTrack('contact_click', { method: how, link_location: loc.pathname });
  }, true);
})(window, document);
