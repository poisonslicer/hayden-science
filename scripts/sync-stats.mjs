/* sync-stats.mjs — run daily by GitHub Actions (and locally with `node scripts/sync-stats.mjs`).
 * Fetches the current h-index (Google Scholar) and rapid rating (chess.com),
 * appends today's value to data/stats.json history, and leaves the previous
 * value untouched if a source is unreachable. No dependencies (Node 18+ fetch). */
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = 'data/stats.json';
const SCHOLAR_ID = 'hS4u7XAAAAAJ';
const CHESS_USER = 'poisonslicer';
const today = new Date().toISOString().slice(0, 10);

const data = JSON.parse(readFileSync(FILE, 'utf8'));
data.hindex ||= { current: 0, updated: '', history: {} };
data.chess ||= { current: 0, updated: '', history: {} };

async function getChessRapid() {
  const r = await fetch(`https://api.chess.com/pub/player/${CHESS_USER}/stats`, {
    headers: { 'User-Agent': 'hayden.science stats sync (+https://github.com/poisonslicer)' }
  });
  if (!r.ok) throw new Error(`chess.com HTTP ${r.status}`);
  const j = await r.json();
  const rating = j?.chess_rapid?.last?.rating;
  if (!rating) throw new Error('no rapid rating in response');
  return rating;
}

async function getHIndex() {
  const r = await fetch(`https://scholar.google.com/citations?user=${SCHOLAR_ID}&hl=en`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36' }
  });
  if (!r.ok) throw new Error(`scholar HTTP ${r.status}`);
  const html = await r.text();
  // The "Cited by" table prints 6 numbers: citations(all/since), h-index(all/since), i10(all/since)
  const nums = [...html.matchAll(/gsc_rsb_std">(\d+)</g)].map(m => +m[1]);
  if (nums.length >= 3) return nums[2]; // h-index, all-time
  throw new Error('could not parse h-index');
}

let changed = false;
try {
  const c = await getChessRapid();
  data.chess.current = c; data.chess.history[today] = c; data.chess.updated = today;
  changed = true; console.log('chess rapid =', c);
} catch (e) { console.warn('chess sync skipped:', e.message); }

try {
  const h = await getHIndex();
  data.hindex.current = h; data.hindex.history[today] = h; data.hindex.updated = today;
  changed = true; console.log('h-index =', h);
} catch (e) { console.warn('h-index sync skipped:', e.message); }

writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n');
console.log(changed ? 'data/stats.json updated.' : 'no changes.');
