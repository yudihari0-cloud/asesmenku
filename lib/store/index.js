import { jsonStore } from './jsonStore';
import { sheetsStore } from './sheetsStore';

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

/** Pastikan database ter-inisialisasi & ter-seed data demo saat masih kosong */
export async function boot() {
  if (!seeded) {
    const users = await store.list('users');
    if (!users.length) {
      const { seedDemo } = await import('../seed');
      await seedDemo(store);
    }
    seeded = true;
  }
  return store;
}

export function getStore() {
  return store;
}
