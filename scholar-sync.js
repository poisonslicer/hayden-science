/* scholar-sync.js — live h-index from Google Scholar, checked at most once per day.
 *
 * Google Scholar doesn't send CORS headers, so a browser can't read it directly.
 * We route the public profile page through a CORS proxy, parse the h-index out of
 * the stats table, cache it in localStorage with today's date, and only re-fetch
 * once the date rolls over. Every distinct day's value is appended to a small
 * history object, so the chart fills in real points over time. If Scholar (or the
 * proxy) blocks the request, we fall back to the cached value, then to FALLBACK. */
(function () {
  const USER     = 'hS4u7XAAAAAJ';   // Hayden Stegall
  const FALLBACK = 1;                 // last confirmed h-index (All)
  const KEY      = 'hs_scholar_v1';
  const COLOR    = '#6E3A7D';
  const today    = new Date().toISOString().slice(0, 10);

  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const save = (o) => { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} };

  function render(history, status) {
    const nowEl = document.getElementById('hindex-now');
    const stEl  = document.getElementById('hindex-status');
    const dates = Object.keys(history).sort();
    let labels, values, current;

    if (dates.length >= 2) {
      labels  = dates.map(d => d.slice(5));         // MM-DD
      values  = dates.map(d => history[d]);
      current = values[values.length - 1];
    } else {
      current = dates.length ? history[dates[0]] : FALLBACK;
      // gentle placeholder trajectory that ends at the real current value
      labels = ['2022', '2023', '2024', '2025', '2026', 'now'];
      values = [0, 0, 0, 1, 1, current];
    }
    if (nowEl) nowEl.textContent = current;
    if (stEl)  stEl.textContent  = status;
    if (window.warmChart) warmChart('c-hindex', { labels, values, color: COLOR, valueFmt: v => v });
  }

  const store   = load();
  const history = store.history || {};

  // paint immediately from cache (or placeholder) so the chart is never empty
  render(history, store.date === today ? 'live · synced today'
                : (Object.keys(history).length ? 'cached' : 'placeholder'));

  // throttle: at most one network attempt per calendar day
  if (store.date === today) return;

  const target = 'https://scholar.google.com/citations?user=' + USER + '&hl=en';
  // try a few public CORS proxies in order — whichever responds first with a parseable page wins
  const PROXIES = [
    u => 'https://api.allorigins.win/raw?url=' + encodeURIComponent(u),
    u => 'https://corsproxy.io/?url=' + encodeURIComponent(u),
    u => 'https://thingproxy.freeboard.io/fetch/' + u
  ];

  function parseHIndex(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    let h = null;
    doc.querySelectorAll('table.gsc_rsb_st tr').forEach(tr => {
      const label = (tr.querySelector('td.gsc_rsb_sc1') || {}).textContent || '';
      if (/h-?index/i.test(label)) {
        const cell = tr.querySelector('td.gsc_rsb_std');
        if (cell) h = parseInt(cell.textContent.trim(), 10);
      }
    });
    return (h == null || isNaN(h)) ? null : h;
  }

  (async () => {
    for (const make of PROXIES) {
      try {
        const res = await fetch(make(target), { cache: 'no-store' });
        if (!res.ok) continue;
        const h = parseHIndex(await res.text());
        if (h == null) continue;
        history[today] = h;
        save({ date: today, history });
        render(history, 'live · synced today');
        return;
      } catch (e) { /* try the next proxy */ }
    }
    // all proxies failed — record the attempt so we don't retry until tomorrow
    save({ date: today, history });
    render(history, Object.keys(history).length ? 'cached (Scholar unreachable)'
                                                : 'placeholder (Scholar unreachable)');
  })();
})();
