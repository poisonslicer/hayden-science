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
})();
