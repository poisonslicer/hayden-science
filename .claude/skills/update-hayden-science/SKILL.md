---
name: update-hayden-science
description: Update and deploy the hayden.science personal site (this repo). Use when changing the last/previous book or movie, book/movie counts, adding or editing a project, editing the About bio or facts, swapping the homepage face photo, or pushing changes live to GitHub Pages.
---

# Updating hayden.science

A static, no-build personal site (plain HTML/CSS/JS) deployed to **GitHub Pages**.

- **Repo:** `poisonslicer/hayden-science` (remote `origin`, branch `main`)
- **Live URL:** https://poisonslicer.github.io/hayden-science/ (served from a subpath — **use relative paths only**, never root-absolute `/...`)
- **Local repo path:** `C:\Users\hayst\Downloads\hayden-warm-site`
- **Auto-synced daily** by `.github/workflows/sync-stats.yml`: h-index (Google Scholar) + rapid rating (chess.com) → `data/stats.json`. Don't hand-edit these unless overriding.

## File map
| What | File |
|------|------|
| Shared theme/colors/layout | `styles.css` |
| Home (cover, orbiting-electron portrait) | `index.html` |
| About (bio + photo collage) | `about.html` |
| Stats (charts + recently read/watched) | `stats.html` |
| Projects gallery (modular cards) | `projects.html` + `projects.js` |
| Project write-ups | `projects/<slug>.md` rendered by `project.html` + `md.js` |
| **All hand-edited content** | **`config.js`** |
| Auto-synced numbers | `data/stats.json` (via the Action) |
| Homepage face image | `assets/me.png` (transparent cutout) |

## Common edits

### Last / previous book or movie, and book/movie counts — edit `config.js` ONLY
Covers are fetched **automatically from the title** (Open Library for books; Jikan/Kitsu for `kind:'anime'`; Wikipedia `(film)` page + iTunes for `kind:'movie'`). Never upload an image.
```js
window.SITE = {
  lastBook: { title: 'Steelheart',  author: 'Brandon Sanderson' },
  prevBook: { title: 'Animal Farm', author: 'George Orwell' },
  lastMovie:{ title: 'Erased',         kind: 'anime', note: 'Boku dake ga Inai Machi' },
  prevMovie:{ title: 'Shutter Island', kind: 'movie', note: '2010' },
  books:  { labels:[...], values:[...] },   // last value = the big number shown
  movies: { labels:[...], values:[...] }
};
```
If a fetched cover is wrong, make the title more specific (e.g., add the author/year) — the lookup keys off the title. Bump the `KEY` constant in `lastmedia.js` (`hs_covers_vN`) only if you need to bust visitors' cached covers.

### Add a project
1. Create `projects/<slug>.md` (starts with `# Title`; supports headings, bold/italic, lists, blockquotes, code fences, links, images).
2. Add an entry to the `PROJECTS` array in `projects.js`:
   - `type`: `'code'` (terminal look), `'story'` (book look), or `'life'` (grassy look)
   - `slug` (must match the .md filename), `title`, `blurb`, `tags`
   - `code` projects: `file` + `code` (array of HTML line strings)
   - `story` projects: `kicker`, `bookTitle`, `byline`
   - `life` projects: `kicker`, `signTitle`

### Edit the bio / facts
`about.html` — prose lives in the `<article class="bio">`; the chips are in `.facts`.

### Swap the homepage face
Replace `assets/me.png` with a **transparent PNG** cutout (square-ish, head centered). If the source has a background, remove it first (e.g. Pillow flood-fill from the edges, then trim to the head). It's displayed at `.me-atom .me-face img { width: 56% }` with electrons orbiting via SVG `animateMotion` in `index.html`.

### h-index / chess
Automatic via the Action. To override manually, edit `data/stats.json` (`current` + `history` map of `YYYY-MM-DD: value`).

## Preview locally (REQUIRED before pushing if you touched project pages)
Project pages and stats fetch local files, so **serve over http — `file://` won't load them**:
```bash
cd "C:\Users\hayst\Downloads\hayden-warm-site"
python -m http.server 5500
# open http://localhost:5500/index.html
```
Verify with a headless screenshot if desired (Chrome `--headless --screenshot=out.png --window-size=1280,H "http://localhost:5500/..."`).

## Deploy (push live)
```bash
cd "C:\Users\hayst\Downloads\hayden-warm-site"
git add -A
git commit -m "Update <what changed>"
git push
```
GitHub Pages redeploys automatically (~1 min). The fastest no-tools update is editing `config.js` directly on github.com (pencil → commit).

## Pitfalls (learned the hard way)
- **Relative paths only** — the site is served under `/hayden-science/`.
- **Watch for CSS class-name collisions** — a generic `.cover`/`.dot` class once overrode hero styles. Scope new generic names (e.g. `.media-card .cover`).
- Cover/stat fetches use keyless, CORS-friendly public APIs; if one is down the UI falls back gracefully (cutesy text cover / last value). Google Scholar may rate-limit GitHub's CI IPs — the Action then keeps the last h-index (chess.com always works).
