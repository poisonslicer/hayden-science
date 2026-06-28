/* shared.js — warm theme helpers: atom mascot + brand logo + CTA easter egg */
(function () {
  // Full mascot atom (warm palette)
  const atom = `<svg viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#2A1E2C" stroke-width="4">
      <ellipse cx="110" cy="110" rx="98" ry="40"/>
      <ellipse cx="110" cy="110" rx="98" ry="40" transform="rotate(60 110 110)"/>
      <ellipse cx="110" cy="110" rx="98" ry="40" transform="rotate(120 110 110)"/>
    </g>
    <circle cx="208" cy="110" r="9" fill="#43B9B2" stroke="#2A1E2C" stroke-width="3"/>
    <circle cx="159" cy="195" r="9" fill="#D94F8A" stroke="#2A1E2C" stroke-width="3"/>
    <circle cx="61" cy="25" r="9" fill="#FF6F61" stroke="#2A1E2C" stroke-width="3"/>
    <circle cx="110" cy="110" r="46" fill="#FF6F61" stroke="#2A1E2C" stroke-width="4"/>
    <circle cx="95" cy="105" r="7.5" fill="#2A1E2C"/>
    <circle cx="125" cy="105" r="7.5" fill="#2A1E2C"/>
    <circle cx="97.6" cy="102.2" r="2.4" fill="#FFF3E9"/>
    <circle cx="127.6" cy="102.2" r="2.4" fill="#FFF3E9"/>
    <path d="M95 124 Q110 135 125 124" stroke="#2A1E2C" stroke-width="4" fill="none" stroke-linecap="round"/>
    <ellipse cx="84" cy="119" rx="6.5" ry="4.2" fill="#2A1E2C" opacity="0.18"/>
    <ellipse cx="136" cy="119" rx="6.5" ry="4.2" fill="#2A1E2C" opacity="0.18"/>
  </svg>`;

  // Small flat atom for the nav brand
  const atomMini = `<svg viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#2A1E2C" stroke-width="9">
      <ellipse cx="110" cy="110" rx="96" ry="40"/>
      <ellipse cx="110" cy="110" rx="96" ry="40" transform="rotate(60 110 110)"/>
      <ellipse cx="110" cy="110" rx="96" ry="40" transform="rotate(120 110 110)"/>
    </g>
    <circle cx="110" cy="110" r="34" fill="#FF6F61" stroke="#2A1E2C" stroke-width="8"/>
  </svg>`;

  document.querySelectorAll('[data-atom]').forEach(el => { el.innerHTML = atom; });
  document.querySelectorAll('[data-atom-mini]').forEach(el => { el.innerHTML = atomMini; });

  document.querySelectorAll('[data-name-tape]').forEach(el => {
    el.innerHTML = atom + '<div class="name-tape">hayden.science</div>';
  });

  // CTA easter egg (home)
  document.querySelectorAll('.cta[data-egg]').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const t = this.textContent;
      this.textContent = '(this is where the stats live) ⚛';
      setTimeout(() => { this.textContent = t; }, 1700);
    });
  });

  /* ============================================================
     Decorations + scroll reveal
     ============================================================ */

  // --- decorative SVG snippets ---
  const atomSVG = s => `<svg viewBox="0 0 100 100" fill="none" stroke="${s}" stroke-width="3.2">
    <ellipse cx="50" cy="50" rx="46" ry="18"/><ellipse cx="50" cy="50" rx="46" ry="18" transform="rotate(60 50 50)"/>
    <ellipse cx="50" cy="50" rx="46" ry="18" transform="rotate(120 50 50)"/><circle cx="50" cy="50" r="7" fill="${s}" stroke="none"/></svg>`;
  const ringSVG = c => `<svg viewBox="0 0 100 100" fill="none" stroke="${c}" stroke-width="4"><circle cx="50" cy="50" r="44"/></svg>`;
  const sparkSVG = c => `<svg viewBox="0 0 100 100"><path d="M50 3 C54 38 62 46 97 50 C62 54 54 62 50 97 C46 62 38 54 3 50 C38 46 46 38 50 3 Z" fill="${c}"/></svg>`;
  const molSVG = (a, b) => `<svg viewBox="0 0 120 100" fill="none" stroke="${a}" stroke-width="4">
    <line x1="24" y1="72" x2="60" y2="40"/><line x1="60" y1="40" x2="98" y2="66"/>
    <circle cx="24" cy="72" r="11" fill="${b}"/><circle cx="60" cy="40" r="13" fill="${a}"/><circle cx="98" cy="66" r="10" fill="${b}"/></svg>`;
  const sqgSVG = c => `<svg viewBox="0 0 120 30" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"><path d="M4 20 Q20 2 36 16 T68 16 T100 16"/></svg>`;

  function deco(target, items) {
    if (!target) return;
    const layer = document.createElement('div');
    layer.className = 'decor'; layer.setAttribute('aria-hidden', 'true');
    items.forEach(it => {
      const s = document.createElement('span');
      if (it.cls) s.className = it.cls;
      s.style.cssText = it.css || '';
      if (it.html) s.innerHTML = it.html;
      layer.appendChild(s);
    });
    target.insertBefore(layer, target.firstChild);
  }

  // home cover
  deco(document.querySelector('.cover'), [
    { cls: 'blob d-drift', css: 'width:240px;height:240px;background:radial-gradient(circle,#FF6F61,transparent 70%);top:-50px;right:-40px' },
    { cls: 'blob d-drift', css: 'width:260px;height:260px;background:radial-gradient(circle,#43B9B2,transparent 70%);bottom:-70px;left:-50px;opacity:.4;animation-duration:21s' },
    { cls: 'd-spin', css: 'width:84px;height:84px;top:30px;left:14px', html: atomSVG('rgba(243,231,214,.38)') },
    { cls: 'd-float s', css: 'width:46px;height:46px;top:62%;left:31%', html: ringSVG('rgba(67,185,178,.5)') },
    { cls: 'd-tw', css: 'width:26px;height:26px;top:22%;left:46%', html: sparkSVG('#FFCF6B') },
    { cls: 'd-tw', css: 'width:16px;height:16px;top:74%;left:9%;animation-delay:.8s', html: sparkSVG('#FF6F61') },
    { cls: 'd-float', css: 'width:96px;height:78px;bottom:46px;right:5%', html: molSVG('rgba(243,231,214,.45)', 'rgba(217,79,138,.6)') }
  ]);

  // about hero (already has orbs + sparkles — add a couple more)
  deco(document.querySelector('.about-hero'), [
    { cls: 'd-spin rev', css: 'width:72px;height:72px;top:34px;right:33%', html: atomSVG('rgba(255,255,255,.4)') },
    { cls: 'd-float s', css: 'width:104px;height:86px;bottom:96px;right:4%', html: molSVG('rgba(255,255,255,.42)', 'rgba(255,207,107,.7)') },
    { cls: 'd-float f', css: 'width:40px;height:40px;top:48%;left:3%', html: ringSVG('rgba(255,217,160,.6)') }
  ]);

  // inner page headers (on paper)
  document.querySelectorAll('.page-head').forEach(h => deco(h, [
    { cls: 'd-spin', css: 'width:70px;height:70px;top:38px;right:6px', html: atomSVG('rgba(110,58,125,.28)') },
    { cls: 'd-tw', css: 'width:22px;height:22px;top:54px;right:21%', html: sparkSVG('#F2A65A') },
    { cls: 'd-float s', css: 'width:54px;height:14px;bottom:6px;right:14%', html: sqgSVG('rgba(67,185,178,.6)') }
  ]));

  // footers (dark)
  document.querySelectorAll('.site-foot').forEach(f => deco(f, [
    { cls: 'blob d-drift', css: 'width:240px;height:240px;background:radial-gradient(circle,#FF6F61,transparent 70%);bottom:-80px;right:-30px;opacity:.4' },
    { cls: 'd-spin rev', css: 'width:78px;height:78px;top:30px;right:7%', html: atomSVG('rgba(243,231,214,.3)') },
    { cls: 'd-tw', css: 'width:20px;height:20px;top:60%;left:4%', html: sparkSVG('#FFCF6B') }
  ]));

  // --- scroll reveal ---
  const body = document.body;
  body.classList.add('reveal-ready');
  const SEL = [
    '.band .sec-label', '.band h2.big', '.band .card', '.enemy', '.browser', '.voice',
    '.posts .post', '.split .receipt', '.split .emails',
    '.chart-card', '.case-wrap', '.lastmedia .media-card',
    '.proj-grid .module', '.legend',
    '.bio > p', '.bio > h2', '.bio > blockquote', '.bio > ul',
    '.site-foot h2', '.site-foot .blk', '.foot-links', '.signoff'
  ];
  const targets = [];
  SEL.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('reveal', 'r-d' + ((i % 5) + 1));
      targets.push(el);
    });
  });

  if (!('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
    targets.forEach(el => io.observe(el));
    // safety net: anything still hidden after 2.5s gets shown
    setTimeout(() => targets.forEach(el => el.classList.add('in')), 2500);
  }
})();
