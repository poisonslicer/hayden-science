# hayden.science

A warm, personal site — home, about, stats, and projects — built as plain HTML/CSS/JS (no build step). Designed to be **hands-off**: the numbers and covers update themselves, and the few manual things live in one file.

## Pages
- `index.html` — home (cover with the orbiting-electron portrait)
- `about.html` — bio + photo collage
- `stats.html` — h-index, chess rating, books, movies + recently read/watched
- `projects.html` → `project.html?p=<slug>` — each project renders a Markdown file from `projects/`

## How to update (the easy part)

**Books, movies, and "recently read/watched": edit `config.js` only.**
```js
window.SITE = {
  lastBook: { title: 'Steelheart',  author: 'Brandon Sanderson' },
  prevBook: { title: 'Animal Farm', author: 'George Orwell' },
  lastMovie:{ title: 'Erased',         kind: 'anime', note: 'Boku dake ga Inai Machi' },
  prevMovie:{ title: 'Shutter Island', kind: 'movie', note: '2010' },
  books:  { labels:['Jan','Feb','Mar','Apr','May','Jun'], values:[3,6,8,11,15,18] },
  movies: { labels:['Jan','Feb','Mar','Apr','May','Jun'], values:[5,9,14,18,23,29] }
};
```
Change a title/number, commit — **covers are fetched automatically from the title** (Open Library for books, MyAnimeList/Kitsu for anime, Wikipedia/iTunes for films). Nothing to upload.

**Auto-synced, no editing needed:**
- **h-index** — from Google Scholar
- **chess rating** — rapid from chess.com (`poisonslicer`)

These refresh daily via a GitHub Action (see `.github/workflows/`) and/or in the visitor's browser.

**Add a project:** drop a `projects/<slug>.md` file and add an entry in `projects.js`.

**Bio / photos:** edit the prose in `about.html`; swap the collage `<svg>` placeholders for `<img>` tags.

## Run locally
Project pages fetch local Markdown, so use a server (not `file://`):
```
python -m http.server 5500
# then open http://localhost:5500
```

## Deploy
Static site — works on GitHub Pages, Cloudflare Pages, or Netlify. For GitHub Pages, serve from the `main` branch root.
