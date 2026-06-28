/* lastmedia.js — renders the "recently read & watched" cards from config.js
 * (window.SITE) and fetches each cover automatically from its title. Hands-off:
 * edit titles in config.js and the artwork updates itself.
 *
 *   • Book cover  → Open Library            (CORS, no key)
 *   • Anime cover → Jikan / Kitsu           (CORS, no key)
 *   • Movie cover → Wikipedia / iTunes      (CORS, no key)
 * If a lookup fails, the cutesy text cover stays as the fallback. */
(function () {
  const C = window.SITE || {};
  const B1 = C.lastBook  || { title: 'Steelheart',     author: 'Brandon Sanderson' };
  const B2 = C.prevBook  || { title: 'Animal Farm',    author: 'George Orwell' };
  const M1 = C.lastMovie || { title: 'Erased',         kind: 'anime' };
  const M2 = C.prevMovie || { title: 'Shutter Island', kind: 'movie' };

  const grid = document.getElementById('media-grid');
  if (!grid) return;

  const byLine = (item, isBook) => {
    if (isBook) return item.author || '';
    const k = item.kind === 'anime' ? 'Anime' : 'Film';
    return item.note ? `${k} · ${item.note}` : k;
  };

  function col(item, isBook, cls, id, sticker) {
    const sm = cls === 'prev' ? ' sm' : '';
    const by = byLine(item, isBook);
    const spine = isBook ? '<span class="cover-spine"></span>' : '';
    const stick = sticker ? `<span class="cover-sticker${isBook ? '' : ' alt'}">${sticker}</span>` : '';
    const before = cls === 'prev' ? '<span class="before">before that</span>' : '';
    return `<div class="cover-col ${cls}">
      <div class="cover ${isBook ? 'book-cover' : 'screen-cover'}${sm}">
        ${spine}${stick}
        <div class="cover-img" id="${id}"><div class="cover-fallback"><span class="cf-title">${item.title}</span><span class="cf-by">${by}</span></div></div>
      </div>
      <div class="media-meta">${before}<h4 class="media-title">${item.title}</h4><p class="media-by">${by}</p></div>
    </div>`;
  }

  grid.innerHTML =
    `<article class="media-card book-card">
      <div class="media-kicker">Books finished</div>
      <div class="cover-cluster">${col(B1, true, 'main', 'cv-book', '★ last')}${col(B2, true, 'prev', 'cv-book-prev', '')}</div>
    </article>
    <article class="media-card screen-card">
      <div class="media-kicker">Watched</div>
      <div class="cover-cluster">${col(M1, false, 'main', 'cv-screen', '▶ last')}${col(M2, false, 'prev', 'cv-screen-prev', '')}</div>
    </article>`;

  // ---- cover sources (all keyless + CORS-friendly) ----
  async function bookCover(title, author) {
    const u = 'https://openlibrary.org/search.json?title=' + encodeURIComponent(title) +
              '&author=' + encodeURIComponent(author || '') + '&limit=1&fields=cover_i';
    const j = await (await fetch(u)).json();
    const id = j.docs && j.docs[0] && j.docs[0].cover_i;
    return id ? 'https://covers.openlibrary.org/b/id/' + id + '-L.jpg' : null;
  }
  async function jikan(title) {
    const j = await (await fetch('https://api.jikan.moe/v4/anime?q=' + encodeURIComponent(title) + '&limit=1')).json();
    const a = j.data && j.data[0];
    return a ? (a.images.jpg.large_image_url || a.images.jpg.image_url) : null;
  }
  async function kitsu(title) {
    const j = await (await fetch('https://kitsu.io/api/edge/anime?filter[text]=' + encodeURIComponent(title) + '&page[limit]=1')).json();
    const p = j.data && j.data[0] && j.data[0].attributes && j.data[0].attributes.posterImage;
    return p ? (p.large || p.medium || p.original || p.small) : null;
  }
  async function wikiPage(title) {
    const j = await (await fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(title))).json();
    if (j.type === 'disambiguation') return null;
    return (j.originalimage && j.originalimage.source) || (j.thumbnail && j.thumbnail.source) || null;
  }
  async function wiki(title) { return wikiPage(title); }
  async function movieWiki(title) {           // prefer the film page so we get the poster, not the novel
    for (const t of [title + ' (film)', title + ' (2010 film)', title]) {
      try { const u = await wikiPage(t); if (u) return u; } catch (e) {}
    }
    return null;
  }
  async function itunes(title) {
    const j = await (await fetch('https://itunes.apple.com/search?term=' + encodeURIComponent(title) + '&media=movie&limit=1')).json();
    const m = j.results && j.results[0];
    return m && m.artworkUrl100 ? m.artworkUrl100.replace('100x100bb', '600x600bb') : null;
  }
  async function screenCover(title, kind) {
    const chain = kind === 'anime' ? [jikan, kitsu, wiki] : [movieWiki, itunes, jikan];
    for (const fn of chain) { try { const u = await fn(title); if (u) return u; } catch (e) {} }
    return null;
  }

  // ---- fetch + inject (cached in the browser) ----
  const KEY = 'hs_covers_v3';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const save = (o) => { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} };
  const cache = load();

  function inject(id, url, alt) {
    const h = document.getElementById(id);
    if (!h || !url) return;
    const img = new Image();
    img.alt = alt;
    img.onload = () => { h.innerHTML = ''; h.appendChild(img); };
    img.src = url;
  }

  const jobs = [
    ['cv-book', B1, true], ['cv-book-prev', B2, true],
    ['cv-screen', M1, false], ['cv-screen-prev', M2, false]
  ];
  jobs.forEach(async ([id, item, isBook]) => {
    const key = (isBook ? 'book:' : 'screen:') + item.title;
    try {
      let url = cache[key];
      if (!url) {
        url = isBook ? await bookCover(item.title, item.author) : await screenCover(item.title, item.kind);
        if (url) { cache[key] = url; save(cache); }
      }
      inject(id, url, item.title);
    } catch (e) {}
  });
})();
