import fs from 'fs';
import path from 'path';

/**
 * Adapter penyimpanan berbasis file JSON (untuk development/demo).
 * Data tersimpan di ./data/db.json agar tahan restart.
 *
 * CATATAN: filesystem lokal TIDAK tersedia di platform serverless seperti
 * Cloudflare Workers/Vercel (read-only). Di sana wajib pakai Google Sheets adapter.
 */
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

let db = null;

const errFs = () =>
  new Error(
    'Penyimpanan file lokal tidak tersedia di platform ini. Wajib memakai Google Sheets: isi environment GOOGLE_SHEETS_ID dan GOOGLE_SERVICE_ACCOUNT_JSON (lihat DEPLOY-CLOUDFLARE.md / README.md).'
  );

function load() {
  if (db) return db;
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    if (fs.existsSync(DB_PATH)) {
      db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    } else {
      db = {};
    }
  } catch {
    throw errFs();
  }
  return db;
}

function persist() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmp = DB_PATH + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(db, null, 1));
    fs.renameSync(tmp, DB_PATH);
  } catch {
    throw errFs();
  }
}

export const jsonStore = {
  name: 'json',
  async list(col) {
    const d = load();
    // Kembalikan salinan agar mutasi di luar store tidak merusak state internal
    return [...(d[col] || [])];
  },
  async get(col, idv) {
    return (await this.list(col)).find((x) => x.id === idv) || null;
  },
  async insert(col, doc) {
    const d = load();
    if (!d[col]) d[col] = [];
    // Idempoten: abaikan bila id sudah ada (cegah duplikat)
    if (d[col].some((x) => x.id === doc.id)) return doc;
    d[col].push(doc);
    persist();
    return doc;
  },
  async update(col, idv, patch) {
    const d = load();
    const arr = d[col] || [];
    const i = arr.findIndex((x) => x.id === idv);
    if (i < 0) return null;
    arr[i] = { ...arr[i], ...patch };
    persist();
    return arr[i];
  },
  async remove(col, idv) {
    const d = load();
    const arr = d[col] || [];
    const i = arr.findIndex((x) => x.id === idv);
    if (i < 0) return false;
    arr.splice(i, 1);
    persist();
    return true;
  },
  async replaceAll(col, docs) {
    const d = load();
    d[col] = docs;
    persist();
  },
};
