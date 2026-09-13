import { jsonStore } from './jsonStore';
import { sheetsStore } from './sheetsStore';
import { id } from '../ids';

/**
 * Memilih adapter penyimpanan:
 *  - Ada GOOGLE_SHEETS_ID + GOOGLE_SERVICE_ACCOUNT_JSON -> Google Sheets
 *  - Selain itu -> file JSON lokal (./data/db.json) untuk demo/development
 */
function pick() {
  if (process.env.GOOGLE_SHEETS_ID && process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    return sheetsStore;
  }
  return jsonStore;
}

const store = pick();

let seeded = false;

/**
 * Pastikan database ter-inisialisasi & ter-seed data demo saat masih kosong.
 *
 * Saat seeding, semua insert dikumpulkan dulu di memori lalu ditulis
 * sekali per koleksi (replaceAll) — supaya tab otomatis dibuat dan jumlah
 * request ke Google hemat (batas Workers free: 50 subrequest/request).
 *
 * Upgrade master CP: bila tab cp masih berisi master lama (kurang dari 100
 * entri), isi ulang otomatis dengan master CP lengkap Fase A-F (BSKAP 046 & 032).
 */
export async function boot() {
  if (!seeded) {
    const users = await store.list('users');
    if (!users.length) {
      const { seedDemo } = await import('../seed');

      const buffer = {}; // col -> [docs]
      const bStore = {
        name: store.name,
        async list(col) {
          return buffer[col] ? [...buffer[col]] : store.list(col);
        },
        async get(col, idv) {
          const arr = buffer[col] || (await store.list(col));
          return arr.find((x) => x.id === idv) || null;
        },
        async insert(col, doc) {
          (buffer[col] = buffer[col] || []).push(doc);
          return doc;
        },
        async update(col, idv, patch) {
          const arr = buffer[col] || [];
          const i = arr.findIndex((x) => x.id === idv);
          if (i >= 0) {
            arr[i] = { ...arr[i], ...patch };
            return arr[i];
          }
          return store.update(col, idv, patch);
        },
        async remove() {
          return false;
        },
        async replaceAll(col, docs) {
          buffer[col] = [...docs];
        },
      };

      await seedDemo(bStore);
      for (const [col, docs] of Object.entries(buffer)) {
        if (docs.length) await store.replaceAll(col, docs);
      }
    }

    const cp = await store.list('cp');
    if (cp.length < 100) {
      const { CP_MASTER } = await import('../cpMaster');
      await store.replaceAll('cp', CP_MASTER.map((c) => ({ id: id('cp'), ...c })));
    }

    seeded = true;
  }
  return store;
}

export function getStore() {
  return store;
}
