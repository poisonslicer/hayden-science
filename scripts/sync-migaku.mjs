/* sync-migaku.mjs — daily Migaku → data/migaku.json sync.
 *
 * Logs into Migaku (Firebase email/password), downloads your SRS database
 * (one gzipped SQLite blob), and counts the words marked KNOWN in Mandarin.
 * Writes the count + today's date into data/migaku.json (keeping history).
 *
 * Runs in GitHub Actions (repo secrets MIGAKU_EMAIL / MIGAKU_PASSWORD) OR
 * locally with the same env vars:
 *     MIGAKU_EMAIL=you@x.com MIGAKU_PASSWORD=... node scripts/sync-migaku.mjs
 *
 * Node 18+ (global fetch + node:zlib). One dependency: sql.js (pure-WASM SQLite,
 * so no native build step in CI). Run `npm install` first.
 *
 * The API shape was reverse-engineered from Migaku's open-source clients
 * (github.com/SirOlaf/unofficial-anki-bridge-for-migaku and
 *  github.com/mh-343/migaku-word-exporter). If Migaku changes it, this script
 * prints a table/column breakdown to the logs so it's easy to adjust.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { createRequire } from 'node:module';
import initSqlJs from 'sql.js';

const require = createRequire(import.meta.url);

const FILE = 'data/migaku.json';
// Mandarin = Simplified (zh_CN) + Traditional (zh_TW). Cantonese ('yue') is excluded.
// Override with MIGAKU_LANGS="zh_CN" (etc.) if you only want one.
const LANGS = (process.env.MIGAKU_LANGS || 'zh_CN,zh_TW').split(',').map(s => s.trim()).filter(Boolean);
// Firebase *Web API key* — a public client identifier that ships inside Migaku's
// own apps (NOT a secret). Overridable via env in case Migaku rotates it.
const API_KEY = process.env.MIGAKU_API_KEY || 'AIzaSyDZvwYKYTsQoZkf3oKsfIQ4ykuy2GZAiH8';
const EMAIL = process.env.MIGAKU_EMAIL;
const PASSWORD = process.env.MIGAKU_PASSWORD;
const today = new Date().toISOString().slice(0, 10);

if (!EMAIL || !PASSWORD) {
  console.error('Missing MIGAKU_EMAIL / MIGAKU_PASSWORD env vars.');
  process.exit(1);
}

async function login() {
  const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD, returnSecureToken: true })
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.idToken) {
    throw new Error(`login failed: HTTP ${r.status} ${j?.error?.message || ''}`.trim());
  }
  return j.idToken;
}

async function downloadDb(idToken) {
  const r = await fetch('https://srs-db-presigned-url-service-api.migaku.com/db-force-sync-download-url', {
    headers: { Authorization: 'Bearer ' + idToken }
  });
  if (!r.ok) throw new Error(`presigned-url request HTTP ${r.status}`);
  const url = (await r.text()).trim().replace(/^"|"$/g, '');
  if (!/^https?:\/\//.test(url)) throw new Error('unexpected presigned response: ' + url.slice(0, 120));
  const dl = await fetch(url);
  if (!dl.ok) throw new Error(`db download HTTP ${dl.status}`);
  let bytes = new Uint8Array(await dl.arrayBuffer());
  if (bytes[0] === 0x1f && bytes[1] === 0x8b) bytes = new Uint8Array(gunzipSync(bytes)); // gzip magic → decompress
  return bytes;
}

function countKnown(bytes, SQL) {
  const db = new SQL.Database(bytes);
  try {
    // Log a breakdown the first time so we can confirm the language codes & statuses.
    const bk = db.exec(
      "SELECT language, knownStatus, COUNT(*) n FROM WordList WHERE del=0 " +
      "GROUP BY language, knownStatus ORDER BY language, knownStatus"
    );
    if (bk.length) {
      console.log('WordList breakdown (language / status / count):');
      for (const row of bk[0].values) console.log('   ', row[0], '/', row[1], '/', row[2]);
    }
    const placeholders = LANGS.map(() => '?').join(',');
    const stmt = db.prepare(
      `SELECT COUNT(*) FROM WordList WHERE knownStatus='KNOWN' AND del=0 AND language IN (${placeholders})`
    );
    stmt.bind(LANGS);
    stmt.step();
    const n = stmt.get()[0];
    stmt.free();
    return n;
  } catch (e) {
    const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
    console.error('Query failed. Tables present:', tables.length ? tables[0].values.flat().join(', ') : '(none)');
    throw e;
  } finally {
    db.close();
  }
}

const SQL = await initSqlJs({ locateFile: () => require.resolve('sql.js/dist/sql-wasm.wasm') });

const idToken = await login();
console.log('logged in to Migaku.');
const bytes = await downloadDb(idToken);
console.log('downloaded SRS database:', bytes.length, 'bytes');
const known = countKnown(bytes, SQL);
console.log(`Mandarin known words (${LANGS.join(', ')}) =`, known);

const data = existsSync(FILE)
  ? JSON.parse(readFileSync(FILE, 'utf8'))
  : { current: 0, updated: '', history: {} };
data.history ||= {};
data.current = known;
data.updated = today;
data.history[today] = known;
writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n');
console.log('data/migaku.json updated.');
