/* projects.js — modular project gallery.
   Each project picks a themed module by `type`:
     code  → a computer/terminal container
     story → a book
     life  → a grassy, real-world scene
   Each module is a link to project.html?p=<slug>, which renders projects/<slug>.md.
   Add a project by dropping an object below + a matching markdown file. */

const GRASS = `
<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
  <circle class="g-sun" cx="348" cy="46" r="25" fill="#FFCF6B" stroke="#2A1E2C" stroke-width="2.5"/>
  <path d="M0 150 Q120 108 220 140 T400 128 L400 240 L0 240 Z" fill="#8fd49a"/>
  <path d="M0 192 Q140 150 262 184 T400 176 L400 240 L0 240 Z" fill="#5fae6b"/>
  <g class="g-blades" stroke="#3f8f53" stroke-width="4" stroke-linecap="round" fill="none">
    <path d="M30 240 Q26 214 18 202"/><path d="M44 240 Q46 212 56 200"/>
    <path d="M120 240 Q116 214 108 204"/><path d="M134 240 Q138 214 148 204"/>
    <path d="M232 240 Q228 216 220 206"/><path d="M246 240 Q250 214 260 204"/>
    <path d="M330 240 Q326 216 318 206"/><path d="M344 240 Q348 216 356 206"/>
  </g>
  <g class="g-flowers">
    <g stroke="#3f8f53" stroke-width="3">
      <line x1="78" y1="240" x2="78" y2="206"/><line x1="186" y1="240" x2="186" y2="200"/><line x1="296" y1="240" x2="296" y2="208"/>
    </g>
    <circle cx="78" cy="204" r="7" fill="#FF6F61" stroke="#2A1E2C" stroke-width="2"/>
    <circle cx="186" cy="198" r="7" fill="#D94F8A" stroke="#2A1E2C" stroke-width="2"/>
    <circle cx="296" cy="206" r="7" fill="#F2A65A" stroke="#2A1E2C" stroke-width="2"/>
    <circle cx="78" cy="204" r="2.4" fill="#FFCF6B"/><circle cx="186" cy="198" r="2.4" fill="#FFCF6B"/><circle cx="296" cy="206" r="2.4" fill="#FFCF6B"/>
  </g>
</svg>`;

const PROJECTS = [
  {
    type: 'code', slug: 'de-novo-binder-pipeline',
    file: 'design_binder.py',
    code: [
      '<span class="cm"># de novo ligand binder — target: clinical small molecule</span>',
      '<span class="pr">&gt;&gt;&gt;</span> bb   = rfdiffusion.generate(target=<span class="str">"ligand.sdf"</span>)',
      '<span class="pr">&gt;&gt;&gt;</span> seqs = ligandmpnn.design(bb, n=<span class="str">96</span>)',
      '<span class="pr">&gt;&gt;&gt;</span> hits = alphafold.filter(seqs, pae=<span class="str">5</span>)',
      '<span class="ok">✓ 7 / 96 designs pass — ordering DNA</span>'
    ],
    title: 'de novo binder pipeline',
    blurb: 'RFdiffusion → LigandMPNN → AlphaFold, wrapped into one command for designing proteins that grip a chosen molecule.',
    tags: ['Python', 'RFdiffusion', 'AlphaFold']
  },
  {
    type: 'story', slug: 'the-last-good-petri-dish',
    kicker: 'Short story',
    bookTitle: 'The Last Good Petri Dish',
    byline: 'by Hayden Stegall',
    title: 'The Last Good Petri Dish',
    blurb: 'A near-future short about a grad student, a contaminated incubator, and the colony that refused to die. (placeholder)',
    tags: ['fiction', 'sci-fi']
  },
  {
    type: 'life', slug: 'engineering-polyketides',
    kicker: 'In real life',
    signTitle: '100+ novel antibiotics',
    title: 'Engineering polyketides',
    blurb: 'Led an undergrad team to retool polyketide synthases — nature’s molecular assembly lines — into brand-new macrolide antibiotics.',
    tags: ['wet lab', 'polyketides', 'teamwork']
  },
  {
    type: 'code', slug: 'ml4biochem-website',
    file: 'deploy.sh',
    code: [
      '<span class="cm"># auto-sync the talk schedule from Google Sheets, daily</span>',
      '<span class="pr">$</span> gh workflow run sync-schedule.yml',
      '<span class="ok">✓ 13 speakers parsed</span>',
      '<span class="ok">✓ schedule.json rebuilt</span>',
      '<span class="pr">$</span> git commit -am <span class="str">"chore: daily sync"</span> &amp;&amp; git push',
      '<span class="ok">✓ deployed — 300+ subscribers</span>'
    ],
    title: 'ML4BioChem website',
    blurb: 'Seminar-series site with a GitHub Actions pipeline that rebuilds the schedule from a Google Sheet every day.',
    tags: ['GitHub Actions', 'JS', 'automation']
  },
  {
    type: 'story', slug: 'blindfold',
    kicker: 'Short story',
    bookTitle: 'Blindfold',
    byline: 'by Hayden Stegall',
    title: 'Blindfold',
    blurb: 'Two players, one board nobody can see, and a single move that takes thirty years to land. (placeholder)',
    tags: ['fiction', 'chess']
  },
  {
    type: 'life', slug: 'community-and-service',
    kicker: 'In real life',
    signTitle: 'Chi Alpha service',
    title: 'Community & service',
    blurb: 'Leading a small group and organizing service — shoe cleanings, a women’s shelter, and cooking for neighbors without homes.',
    tags: ['community', 'mentoring']
  }
];

/* ---- renderers ---- */
function tagHtml(tags) { return (tags || []).map(t => `<span>${t}</span>`).join(''); }
function footHtml(p) {
  return `<div class="m-foot"><h3>${p.title}</h3><p>${p.blurb}</p>
    <div class="m-tags">${tagHtml(p.tags)}</div>
    <span class="m-open">Read the write-up →</span></div>`;
}
const href = p => `project.html?p=${encodeURIComponent(p.slug)}`;

function renderCode(p) {
  const lines = p.code.map(l => `<div class="ln">${l}</div>`).join('');
  return `<a class="module code" href="${href(p)}">
    <div class="term">
      <div class="term-bar">
        <span class="tdot" style="background:#FF6F61"></span>
        <span class="tdot" style="background:#F2A65A"></span>
        <span class="tdot" style="background:#43B9B2"></span>
        <span class="ttitle">${p.file}</span>
      </div>
      <div class="term-body">${lines}<div class="ln"><span class="pr">$</span> <span class="cur"></span></div></div>
    </div>
    ${footHtml(p)}
  </a>`;
}

function renderStory(p) {
  return `<a class="module story" href="${href(p)}">
    <div class="book-stage">
      <div class="book">
        <div class="cover-face">
          <div class="ktag">${p.kicker}</div>
          <div class="btitle">${p.bookTitle}</div>
          <div class="byline">${p.byline}</div>
        </div>
        <div class="spine"></div>
        <div class="pages"></div>
        <div class="ribbon"></div>
      </div>
    </div>
    ${footHtml(p)}
  </a>`;
}

function renderLife(p) {
  return `<a class="module life" href="${href(p)}">
    <div class="life-stage">
      ${GRASS}
      <div class="life-sign"><div class="lk">${p.kicker}</div><div class="lt">${p.signTitle}</div></div>
    </div>
    ${footHtml(p)}
  </a>`;
}

const RENDERERS = { code: renderCode, story: renderStory, life: renderLife };

(function () {
  const grid = document.getElementById('proj-grid');
  if (!grid) return;
  grid.innerHTML = PROJECTS.map(p => (RENDERERS[p.type] || (() => ''))(p)).join('');
})();
