/* synced-stats.js — renders the h-index and chess-rating charts from
 * data/stats.json, which a GitHub Action refreshes once a day. Same-origin
 * fetch, so it's reliable on the deployed site. If history is still sparse,
 * it draws a gentle ramp up to the current value. */
(function () {
  fetch('data/stats.json', { cache: 'no-store' })
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(d => {
      renderMetric('c-hindex', 'hindex-now', 'hindex-status', d.hindex, '#6E3A7D', ['2022', '2023', '2024', '2025', '2026']);
      renderMetric('c-elo',    'elo-now',    'elo-status',    d.chess,  '#43B9B2', ['Feb', 'Mar', 'Apr', 'May', 'Jun']);
    })
    .catch(() => { setText('hindex-status', 'offline'); setText('elo-status', 'offline'); });

  // Mandarin words known — synced from Migaku into its own file (written by the
  // local sync task, kept separate from stats.json so the two never clobber each other).
  if (document.getElementById('c-migaku')) {
    fetch('data/migaku.json', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(m => renderMetric('c-migaku', 'migaku-now', 'migaku-status', m, '#F2A65A', ['Feb', 'Mar', 'Apr', 'May', 'Jun']))
      .catch(() => setText('migaku-status', 'offline'));
  }

  function renderMetric(chartId, nowId, statusId, m, color, fbLabels) {
    if (!m) return;
    const hist = m.history || {};
    const dates = Object.keys(hist).sort();
    let labels, values, chartDates, current;
    if (dates.length >= 2) {
      labels = dates.map(shortDate);
      chartDates = dates;
      values = dates.map(d => hist[d]);
      current = values[values.length - 1];
    } else {
      current = (m.current != null) ? m.current : (dates.length ? hist[dates[0]] : 0);
      labels = fbLabels.concat(['now']);
      chartDates = labels;
      values = rampTo(current, labels.length);
    }
    setText(nowId, current);
    setText(statusId, m.updated ? ('synced ' + m.updated) : 'auto-synced daily');
    if (window.warmChart) warmChart(chartId, { labels, dates: chartDates, values, color, valueFmt: v => v });
  }

  function rampTo(c, n) {
    const step = Math.max(1, Math.round(Math.abs(c) * 0.02));
    const arr = [];
    for (let i = 0; i < n; i++) arr.push(Math.max(0, c - (n - 1 - i) * step));
    arr[n - 1] = c;
    return arr;
  }
  function setText(id, t) { const e = document.getElementById(id); if (e) e.textContent = t; }
  function shortDate(value) {
    const parts = String(value).split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return parts.length === 3 ? `${months[Number(parts[1]) - 1]} ${Number(parts[2])}` : value;
  }
})();
