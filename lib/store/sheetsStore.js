import crypto from 'crypto';

/**
 * Adapter penyimpanan Google Sheets (produksi).
 *
 * Setiap koleksi = 1 tab/sheet dengan nama koleksi.
 * Baris pertama = header (nama kolom), baris berikutnya = data.
 * Nilai non-string (angka, boolean, array, objek) di-encode JSON agar
 * lossless, mis. 5 -> "5", ["A","B"] -> '["A","B"]'.
 *
 * Env yang dibutuhkan:
 *   GOOGLE_SHEETS_ID              — ID spreadsheet (URL lengkap pun boleh, otomatis dibersihkan)
 *   GOOGLE_SERVICE_ACCOUNT_JSON   — JSON service account (raw atau base64)
 *
 * Setup: aktifkan Google Sheets API di Google Cloud, buat service account
 * key JSON, lalu bagikan spreadsheet ke email service account (peran Editor).
 */

const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
const CACHE_TTL = 4000; // ms — kurangi pemakaian kuota API

/** Ambil ID spreadsheet murni dari input apa pun.
 *  Aman terhadap: URL lengkap, /edit, #gid, ?usp, spasi, kutip, enter. */
export function cleanSheetsId(raw) {
  let s = String(raw || '').trim();
  const i = s.indexOf('/d/');
  if (i >= 0) s = s.slice(i + 3);
  s = s.split(/[/?#]/)[0];
  s = s.replace(/[^A-Za-z0-9_-]/g, '');
  const m = s.match(/[a-zA-Z0-9_-]{25,}/);
  return m ? m[0] : s;
}

// Definisi kolom per koleksi (baris header di spreadsheet)
export const SHEETS_SCHEMA = {
  users: ['id', 'role', 'nama', 'username', 'nisn', 'kelasId', 'sekolahId', 'namaSekolah', 'wa', 'nip', 'jabatan', 'foto', 'pwHash', 'createdAt'],
  sekolah: ['id', 'nama', 'alamat', 'logo', 'createdAt'],
  kelas: ['id', 'nama', 'tingkat', 'fase', 'sekolahId', 'guruId'],
  cp: ['id', 'fase', 'mapel', 'elemen', 'kode', 'teks', 'sumber'],
  kisi: ['id', 'guruId', 'judul', 'mapel', 'fase', 'kelas', 'tp', 'items', 'createdAt'],
  soal: ['id', 'guruId', 'kisiId', 'kisiItemId', 'tipe', 'pertanyaan', 'gambar', 'opsi', 'kiri', 'kanan', 'kunci', 'kunciPoin', 'skor', 'level', 'createdAt'],
  asesmen: ['id', 'guruId', 'judul', 'kisiId', 'kelasIds', 'token', 'durasiMenit', 'buka', 'tutup', 'acakSoal', 'acakOpsi', 'tampilkanHasil', 'anonimLeaderboard', 'kktp', 'refleksiQs', 'soalIds', 'status', 'createdAt'],
  attempt: ['id', 'asesmenId', 'siswaId', 'kelasId', 'mulai', 'selesai', 'status', 'soalOrder', 'jawaban', 'perSoal', 'render', 'skorObjektif', 'skorEssay', 'skorAkhir'],
  refleksi: ['id', 'asesmenId', 'siswaId', 'attemptId', 'jawaban', 'createdAt'],
};

function creds() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON belum di-set');
  const s = raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
  return JSON.parse(s);
}

/** String → base64url (tanpa dependensi Node, aman untuk Workers) */
function bytesToB64url(u8) {
  let s = '';
  for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
const b64url = (str) => bytesToB64url(new TextEncoder().encode(str));

/** PEM private key (PKCS#8) → ArrayBuffer */
function pemToPkcs8(pem) {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s+/g, '');
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr.buffer;
}

/** Tanda tangan RS256 memakai WebCrypto — berjalan di Node.js & Cloudflare Workers */
async function signRsaSha256(signInput, privateKeyPem) {
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToPkcs8(privateKeyPem),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(signInput));
  return bytesToB64url(new Uint8Array(sig));
}

let cachedToken = null;
let tokenExp = 0;

async function getAccessToken() {
  const now = Date.now() / 1000;
  if (cachedToken && tokenExp - 60 > now) return cachedToken;
  const sa = creds();
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: SCOPES,
      aud: 'https://oauth2.googleapis.com/token',
      iat: Math.floor(now),
      exp: Math.floor(now) + 3600,
    })
  );
  const signInput = header + '.' + claim;
  const signature = await signRsaSha256(signInput, sa.private_key);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'AsesmenKu/1.0' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: signInput + '.' + signature,
    }),
  });
  const j = await res.json();
  if (!j.access_token) throw new Error('Gagal OAuth Google: ' + JSON.stringify(j));
  cachedToken = j.access_token;
  tokenExp = now + (j.expires_in || 3600);
  return cachedToken;
}

async function gapi(path, init) {
  const t = await getAccessToken();
  const base = 'https://sheets.googleapis.com/v4/spreadsheets/' + cleanSheetsId(process.env.GOOGLE_SHEETS_ID);
  const res = await fetch(base + path, {
    ...init,
    headers: {
      Authorization: 'Bearer ' + t,
      'Content-Type': 'application/json',
      'User-Agent': 'AsesmenKu/1.0',
      ...(init?.headers || {}),
    },
  });
  const text = await res.text();
  let j;
  try {
    j = JSON.parse(text);
  } catch {
    let finalUrl = '?';
    try { finalUrl = res.url || '?'; } catch {}
    const dipakai = cleanSheetsId(process.env.GOOGLE_SHEETS_ID);
    throw new Error(
      'Google API non-JSON. status=' + res.status + ' finalUrl="' + finalUrl + '" sheetId="' + dipakai + '" body: ' + text.slice(0, 400)
    );
  }
  if (!res.ok) throw new Error(j.error?.message || 'Google Sheets API error ' + res.status);
  return j;
}

const enc = (v) => JSON.stringify(v === undefined || v === null ? '' : v);
const dec = (cell) => {
  if (cell === '' || cell === undefined || cell === null) return '';
  try {
    return JSON.parse(cell);
  } catch {
    return cell;
  }
};

const cache = {}; // col -> {t, rows}

function fromCache(col) {
  const c = cache[col];
  if (c && Date.now() - c.t < CACHE_TTL) return [...c.rows]; // salinan agar aman dari mutasi eksternal
  return null;
}
function toCache(col, rows) {
  cache[col] = { t: Date.now(), rows };
  return rows;
}
const invalidate = (col) => delete cache[col];

async function ensureTab(col) {
  const meta = await gapi('?fields=sheets.properties.title');
  const titles = (meta.sheets || []).map((s) => s.properties.title);
  if (titles.includes(col)) return;
  await gapi(':batchUpdate', {
    method: 'POST',
    body: JSON.stringify({ requests: [{ addSheet: { properties: { title: col } } }] }),
  });
  const cols = SHEETS_SCHEMA[col] || ['id'];
  await gapi(`/values/${encodeURIComponent(col + '!A1')}?valueInputOption=RAW`, {
    method: 'PUT',
    body: JSON.stringify({ values: [cols] }),
  });
}

async function readRows(col) {
  const hit = fromCache(col);
  if (hit) return hit;
  const cols = SHEETS_SCHEMA[col] || ['id'];
  let values = [];
  try {
    const j = await gapi(`/values/${encodeURIComponent(col + '!A1:ZZ')}`);
    values = j.values || [];
  } catch (e) {
    if (!/unable to parse range/i.test(e.message)) {
      // tab mungkin belum ada — buat lalu baca ulang
      await ensureTab(col);
      const j = await gapi(`/values/${encodeURIComponent(col + '!A1:ZZ')}`);
      values = j.values || [];
    }
  }
  const rows = values.slice(1).filter((r) => r[0]).map((r) => {
    const doc = {};
    cols.forEach((c, i) => (doc[c] = dec(r[i])));
    return doc;
  });
  return toCache(col, rows);
}

export const sheetsStore = {
  name: 'sheets',
  async list(col) {
    return readRows(col);
  },
  async get(col, idv) {
    return (await readRows(col)).find((x) => x.id === idv) || null;
  },
  async insert(col, doc) {
    const cols = SHEETS_SCHEMA[col] || ['id'];
    const full = { ...doc };
    for (const c of cols) if (full[c] === undefined) full[c] = doc[c] ?? '';
    const row = cols.map((c) => enc(full[c]));
    await gapi(`/values/${encodeURIComponent(col + '!A1')}?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
      method: 'POST',
      body: JSON.stringify({ values: [row] }),
    });
    invalidate(col);
    return doc;
  },
  async update(col, idv, patch) {
    const rows = await readRows(col);
    const idx = rows.findIndex((x) => x.id === idv);
    if (idx < 0) return null;
    const merged = { ...rows[idx], ...patch };
    const cols = SHEETS_SCHEMA[col] || ['id'];
    const row = cols.map((c) => enc(merged[c] ?? ''));
    await gapi(`/values/${encodeURIComponent(`${col}!A${idx + 2}`)}?valueInputOption=RAW`, {
      method: 'PUT',
      body: JSON.stringify({ values: [row] }),
    });
    invalidate(col);
    return merged;
  },
  async remove(col, idv) {
    const rows = await readRows(col);
    const sisa = rows.filter((x) => x.id !== idv);
    if (sisa.length === rows.length) return false;
    const cols = SHEETS_SCHEMA[col] || ['id'];
    const values = [cols, ...sisa.map((d) => cols.map((c) => enc(d[c] ?? '')))];
    await gapi(`/values/${encodeURIComponent(col + '!A1')}?valueInputOption=RAW`, {
      method: 'PUT',
      body: JSON.stringify({ values }),
    });
    invalidate(col);
    return true;
  },
  async replaceAll(col, docs) {
    await ensureTab(col);
    const cols = SHEETS_SCHEMA[col] || ['id'];
    const values = [cols, ...docs.map((d) => {
      const full = { ...d };
      for (const c of cols) if (full[c] === undefined) full[c] = '';
      return cols.map((c) => enc(full[c]));
    })];
    await gapi(`/values/${encodeURIComponent(col + '!A1')}?valueInputOption=RAW`, {
      method: 'PUT',
      body: JSON.stringify({ values }),
    });
    invalidate(col);
  },
};
