/* charts.js — tiny dependency-free SVG line/area charts in the warm theme.
   Usage: warmChart('elId', { labels:[...], values:[...], color:'#FF6F61', valueFmt:v=>v }) */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const W = 540, H = 250;
  const padL = 66, padR = 22, padT = 24, padB = 34;

  function smoothPath(pts) {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const c1x = p1.x + (p2.x - p0.x) / 6;
      const c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6;
      const c2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  }

  window.warmChart = function (elId, opts) {
    const el = document.getElementById(elId);
    if (!el) return;
    const labels = opts.labels || [], values = opts.values || [];
    const dates = opts.dates || labels;
    const color = opts.color || '#FF6F61';
    const fmt = opts.valueFmt || (v => v);
    const axisFmt = opts.axisFmt || fmt;
    const n = values.length;
    if (!n) return;

    const dataLo = Math.min(...values), dataHi = Math.max(...values);
    const ticks = makeTicks(dataLo, dataHi, 4);
    const tickStep = ticks.length > 1 ? ticks[1] - ticks[0] : 1;
    const lo = ticks[0] - tickStep * 0.24;
    const hi = ticks[ticks.length - 1] + tickStep * 0.24;

    const x = i => n === 1 ? (padL + W - padR) / 2 : padL + (i * (W - padL - padR)) / (n - 1);
    const y = v => padT + (1 - (v - lo) / (hi - lo)) * (H - padT - padB);
    const pts = values.map((v, i) => ({ x: x(i), y: y(v) }));

    const gid = 'grad_' + elId;
    const line = smoothPath(pts);
    const baseY = H - padB;
    const area = line + ` L ${pts[n - 1].x.toFixed(1)} ${baseY} L ${pts[0].x.toFixed(1)} ${baseY} Z`;

    // Warm, compact y-axis badges + quiet guide lines.
    let grid = '';
    ticks.forEach(tick => {
      const gy = y(tick);
      const tickLabel = String(axisFmt(tick));
      const badgeWidth = Math.max(28, 12 + tickLabel.length * 6.4);
      const badgeX = padL - badgeWidth - 10;
      grid += `<line class="chart-gridline" x1="${padL}" y1="${gy.toFixed(1)}" x2="${W - padR}" y2="${gy.toFixed(1)}"/>`;
      grid += `<g class="chart-y-tick">
        <rect x="${badgeX.toFixed(1)}" y="${(gy - 9).toFixed(1)}" width="${badgeWidth.toFixed(1)}" height="18" rx="9" style="--chart-color:${color}"/>
        <text x="${(badgeX + badgeWidth / 2).toFixed(1)}" y="${(gy + 3.5).toFixed(1)}" text-anchor="middle">${esc(tickLabel)}</text>
      </g>`;
    });
    grid += `<line class="chart-baseline" x1="${padL}" y1="${baseY}" x2="${W - padR}" y2="${baseY}"/>`;

    // x labels (thin out if many)
    const step = n > 8 ? Math.ceil(n / 6) : 1;
    const labelIndexes = [];
    for (let i = 0; i < n; i += step) labelIndexes.push(i);
    if (labelIndexes[labelIndexes.length - 1] !== n - 1) {
      if (n - 1 - labelIndexes[labelIndexes.length - 1] < step * 0.65) labelIndexes.pop();
      labelIndexes.push(n - 1);
    }
    const labelIndexSet = new Set(labelIndexes);
    let xlabels = '';
    labels.forEach((lab, i) => {
      if (!labelIndexSet.has(i)) return;
      xlabels += `<text x="${x(i).toFixed(1)}" y="${H - 12}" text-anchor="middle" font-family="Courier Prime,monospace" font-size="11" fill="#9a8c93">${esc(lab)}</text>`;
    });

    // Keep every point interactive, but only show a representative set until hover/focus.
    let dots = '';
    pts.forEach((p, i) => {
      const last = i === n - 1;
      const visible = labelIndexSet.has(i);
      const pointDate = dates[i] == null ? labels[i] : dates[i];
      const pointValue = fmt(values[i]);
      dots += `<g class="chart-point" tabindex="0" role="button" aria-label="${esc(displayDate(pointDate))}: ${esc(pointValue)}" data-index="${i}">
        <title>${esc(pointDate)}: ${esc(pointValue)}</title>
        <circle class="chart-hit" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="11" fill="#fff" fill-opacity="0.001"/>
        <circle class="chart-dot${visible ? '' : ' chart-dot-muted'}" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${last ? 6 : 3.4}" fill="${last ? color : '#fff'}" stroke="${color}" stroke-width="${last ? 2.5 : 2}"/>
      </g>`;
    });

    // last-value label bubble
    const lp = pts[n - 1];
    const labelTxt = fmt(values[n - 1]);
    const bw = 22 + String(labelTxt).length * 8.5;
    let bx = lp.x - bw - 10;
    if (bx < padL) bx = lp.x + 10;
    const by = Math.max(padT, lp.y - 16);
    const bubble =
      `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${bw}" height="26" rx="13" fill="${color}" stroke="#2A1E2C" stroke-width="2"/>` +
      `<text x="${(bx + bw / 2).toFixed(1)}" y="${(by + 17).toFixed(1)}" text-anchor="middle" font-family="Fraunces,serif" font-weight="700" font-size="13" fill="#fff">${esc(labelTxt)}</text>`;

    el.innerHTML =
      `<svg viewBox="0 0 ${W} ${H}" xmlns="${NS}" role="img">
        <defs>
          <linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="${color}" stop-opacity="0.34"/>
            <stop offset="1" stop-color="${color}" stop-opacity="0"/>
          </linearGradient>
        </defs>
        ${grid}
        <path d="${area}" fill="url(#${gid})"/>
        <path class="spark" d="${line}" fill="none" stroke="${color}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>
        ${dots}
        ${xlabels}
        ${bubble}
      </svg><div class="chart-tooltip" role="status" aria-live="polite" style="--chart-color:${color}" hidden></div>`;

    const tooltip = el.querySelector('.chart-tooltip');
    const svg = el.querySelector('svg');
    let pinnedIndex = null;
    const clearActive = () => el.querySelectorAll('.chart-point.is-active').forEach(point => point.classList.remove('is-active'));
    const showTooltip = index => {
      const date = dates[index] == null ? labels[index] : dates[index];
      clearActive();
      el.querySelector(`.chart-point[data-index="${index}"]`).classList.add('is-active');
      tooltip.innerHTML = `<span>${esc(displayDate(date))}</span><strong>${esc(fmt(values[index]))}</strong>`;
      tooltip.hidden = false;
      const rect = svg.getBoundingClientRect();
      const px = pts[index].x * rect.width / W;
      const py = pts[index].y * rect.height / H;
      tooltip.style.left = `${px}px`;
      tooltip.style.top = `${Math.max(44, py - 5)}px`;
      tooltip.dataset.side = px < 94 ? 'start' : (px > rect.width - 94 ? 'end' : 'center');
    };
    const hideTooltip = () => {
      tooltip.hidden = true;
      clearActive();
    };
    el.querySelectorAll('.chart-point').forEach(point => {
      const index = Number(point.getAttribute('data-index'));
      point.addEventListener('mouseenter', () => showTooltip(index));
      point.addEventListener('mouseleave', () => { if (pinnedIndex !== index) hideTooltip(); });
      point.addEventListener('focus', () => showTooltip(index));
      point.addEventListener('blur', () => { if (pinnedIndex !== index) hideTooltip(); });
      point.addEventListener('click', () => {
        if (pinnedIndex === index) {
          pinnedIndex = null;
          hideTooltip();
        } else {
          pinnedIndex = index;
          showTooltip(index);
        }
      });
      point.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        point.click();
      });
    });
  };

  function makeTicks(min, max, count) {
    if (min === max) {
      const step = niceStep(Math.max(1, Math.abs(min) * 0.15));
      return [Math.max(0, min - step), min, min + step].filter((value, index, arr) => index === 0 || value !== arr[index - 1]);
    }
    const step = niceStep((max - min) / (count - 1));
    const start = Math.floor(min / step) * step;
    const end = Math.ceil(max / step) * step;
    const ticks = [];
    for (let value = start; value <= end + step * 0.01; value += step) ticks.push(roundTick(value));
    return ticks.length >= 2 ? ticks : [start, start + step, start + step * 2, start + step * 3];
  }

  function niceStep(value) {
    const exponent = Math.floor(Math.log10(value));
    const fraction = value / Math.pow(10, exponent);
    const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
    return niceFraction * Math.pow(10, exponent);
  }

  function roundTick(value) { return Number(value.toPrecision(12)); }
  function displayDate(value) {
    const text = String(value);
    const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return text;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[Number(match[2]) - 1]} ${Number(match[3])}, ${match[1]}`;
  }
  function esc(value) {
    return String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }
})();
