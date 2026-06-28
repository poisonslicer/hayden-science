/* ============================================================
   config.js — THE ONE FILE YOU EDIT to update the site.
   Change a title or a number, commit, and GitHub Pages redeploys.
   Book/movie covers are fetched automatically from the title,
   so you never upload an image.
   (h-index and chess rating update themselves via a GitHub Action.)
   ============================================================ */
window.SITE = {
  // Books — most recent first. Covers auto-fetched (Open Library) by title.
  lastBook: { title: 'Steelheart',  author: 'Brandon Sanderson' },
  prevBook: { title: 'Animal Farm', author: 'George Orwell' },

  // Watched — kind: 'anime' (MyAnimeList/Kitsu) or 'movie' (Wikipedia/iTunes).
  lastMovie: { title: 'Erased',         kind: 'anime', note: 'Boku dake ga Inai Machi' },
  prevMovie: { title: 'Shutter Island', kind: 'movie', note: '2010' },

  // Cumulative counts this year — the last number shows as the big figure.
  books:  { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], values: [3, 6, 8, 11, 15, 18] },
  movies: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], values: [5, 9, 14, 18, 23, 29] }
};
