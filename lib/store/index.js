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
 * Pastikan database ter-inisialisasi, ter-seed data demo saat masih kosong,
 * dan menjalankan migrasi ringan yang idempotent (aman diulang):
 *  - Upgrade master CP ke versi lengkap Fase A-F bila masih versi lama (<100 entri)
 *  - Tandai akun "yudi" sebagai admin (panel kode aktivasi)
 *  - Isi masaAktifSampai untuk sekolah lama yang belum punya
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

    try {
      // Migrasi 1: master CP lengkap (Fase A-F)
      const cp = await store.list('cp');
      if (cp.length < 100) {
        const { CP_MASTER } = await import('../cpMaster');
        await store.replaceAll('cp', CP_MASTER.map((c) => ({ id: id('cp'), ...c })));
      }

      // Migrasi 2: admin = hanya yudi; bersihkan nilai admin liar pada lainnya
      for (const u of users) {
        const harusAdmin = u.role === 'guru' && u.username === 'yudi';
        if (harusAdmin && u.admin !== true) {
          await store.update('users', u.id, { admin: true });
        } else if (!harusAdmin && u.admin) {
          await store.update('users', u.id, { admin: '' });
        }
      }

      // Migrasi 3: sekolah tanpa masa aktif -> demo 10 tahun, lainnya 1 tahun
      const sekolahs = await store.list('sekolah');
      for (const s of sekolahs) {
        const ms = s.masaAktifSampai ? new Date(s.masaAktifSampai).getTime() : NaN;
        if (!ms || Number.isNaN(ms)) {
          const tahun = s.id === 'demo' ? 10 : 1;
          await store.update('sekolah', s.id, {
            masaAktifSampai: new Date(Date.now() + tahun * 365 * 864e5).toISOString(),
          });
        }
      }
    } catch {
      // migrasi gagal tidak boleh menghalangi app
    }

    seeded = true;
  }
  return store;
}

export function getStore() {
  return store;
}
