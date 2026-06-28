/* chess-sync.js — live rapid rating from chess.com, checked at most once per day.
 *
 * chess.com's public "Published-Data" API sends CORS headers, so the browser can
 * read it directly (no proxy needed). We read chess_rapid.last.rating, cache it
 * with today's date, throttle to one fetch per day, and append each day's value
 * to a history object so the chart fills in over time. Falls back to the cached
 * value, then to FALLBACK, if the request fails. */
(function () {
  const USER     = 'poisonslicer';
  const FALLBACK = 1421;            // last confirmed rapid rating
  const KEY      = 'hs_chess_v1';
  const COLOR    = '#43B9B2';
  const today    = new Date().toISOString().slice(0, 10);

  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const save = (o) => { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} };

  function render(history, status) {
    const nowEl = document.getElementById('elo-now');
    const stEl  = document.getElementById('elo-status');
    const dates = Object.keys(history).sort();
    let labels, values, current;

    if (dates.length >= 2) {
      labels  = dates.map(d => d.slice(5));
      values  = dates.map(d => history[d]);
      current = values[values.length - 1];
    } else {
      current = dates.length ? history[dates[0]] : FALLBACK;
      // gentle placeholder climb that lands on the real current rating
      labels = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'now'];
      values = [current - 120, current - 70, current - 90, current - 30, current - 15, current];
    }
    if (nowEl) nowEl.textContent = current;
    if (stEl)  stEl.textContent  = status;
    if (window.warmChart) warmChart('c-elo', { labels, values, color: COLOR, valueFmt: v => v });
  }

  const store   = load();
  const history = store.history || {};

  render(history, store.date === today ? 'live · synced today'
                : (Object.keys(history).length ? 'cached' : 'placeholder'));

  if (store.date === today) return;   // once per day

  fetch('https://api.chess.com/pub/player/' + USER + '/stats', { cache: 'no-store' })
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(data => {
      const rating = data && data.chess_rapid && data.chess_rapid.last && data.chess_rapid.last.rating;
      if (!rating) throw new Error('no rapid rating');
      history[today] = rating;
      save({ date: today, history });
      render(history, 'live · synced today');
    })
    .catch(() => {
      save({ date: today, history });   // record the attempt; don't retry until tomorrow
      render(history, Object.keys(history).length ? 'cached (chess.com unreachable)'
                                                  : 'placeholder (chess.com unreachable)');
    });
})();
