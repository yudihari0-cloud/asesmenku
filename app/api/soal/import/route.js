import * as XLSX from 'xlsx';
import { ctx, ok, bad, requireUser } from '@/lib/api';
import { id } from '@/lib/ids';

const LEVEL_OK = new Set(['L1', 'L2', 'L3']);
const BENTUK_LABEL = { PG: 'Pilihan Ganda', BS: 'Benar/Salah', MENJODOKAN: 'Menjodohkan', ESSAY: 'Essay' };

function cekLevel(v) {
  const s = String(v || '').trim().toUpperCase();
  return LEVEL_OK.has(s) ? s : 'L1';
}
function cekSkor(v, def = 10) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : def;
}

/** Parse kunci menjodohkan "1-A;2-B;3-C" → {p0:'p0', p1:'p1', p2:'p2'} */
function parseKunciJodoh(str, nKiri, nKanan) {
  const parts = String(str || '').split(';').map((s) => s.trim()).filter(Boolean);
  const kunci = {};
  if (!parts.length) {
    for (let i = 0; i < nKiri; i++) kunci['p' + i] = 'p' + i;
    return kunci;
  }
  for (const p of parts) {
    const m = p.match(/^(\d+)\s*[-=.]\s*([A-Za-z])$/);
    if (!m) return null;
    const l = parseInt(m[1], 10) - 1;
    const r = m[2].toUpperCase().charCodeAt(0) - 65;
    if (l < 0 || l >= nKiri || r < 0 || r >= nKanan) return null;
    kunci['p' + l] = 'p' + r;
  }
  return kunci;
}

/** POST multipart {file, kisiId} — import bank soal massal dari Excel */
export async function POST(req) {
  const { store, user } = await ctx(req);
  const gate = requireUser(user, ['guru', 'admin']);
  if (gate) return gate;

  let file, kisiId;
  try {
    const fd = await req.formData();
    file = fd.get('file');
    kisiId = fd.get('kisiId');
  } catch {
    return bad('Unggahan tidak terbaca');
  }
  if (!file) return bad('Pilih file Excel terlebih dahulu');

  const kisi = kisiId ? await store.get('kisi', kisiId) : null;
  if (kisiId && (!kisi || (kisi.guruId !== user.id && user.role !== 'admin'))) {
    return bad('Kisi-kisi tidak ditemukan', 404);
  }
  const items = kisi?.items || [];

  let wb;
  try {
    wb = XLSX.read(Buffer.from(await file.arrayBuffer()));
  } catch {
    return bad('File tidak dapat dibaca. Gunakan template .xlsx yang disediakan.');
  }

  const hasil = { created: 0, perType: {}, skipped: [] };
  const skip = (tipe, nama, alasan) => hasil.skipped.push({ tipe, nama: String(nama || '').slice(0, 60), alasan });

  const proses = (namaSheet, tipe, build) => {
    const ws = wb.Sheets[namaSheet];
    if (!ws) return;
    let rows = [];
    try {
      rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
    } catch {
      skip(tipe, '-', 'Sheet tidak terbaca');
      return;
    }
    for (const row of rows) {
      const p = String(row.Pertanyaan || row.pertanyaan || '').trim();
      if (!p || /^contoh/i.test(p)) continue;
      const doc = build(row, p);
      if (doc.error) {
        skip(tipe, p, doc.error);
        continue;
      }
      const indNo = parseInt(row.IndikatorNo || row.IndikatorNo, 10);
      const item = Number.isFinite(indNo) ? items[indNo - 1] : null;
      const full = {
        id: id('so'),
        guruId: user.id,
        kisiId: kisi?.id || '',
        kisiItemId: item?.id || '',
        gambar: String(row['Gambar (URL)'] || row.Gambar || '').trim() || null,
        level: cekLevel(row.Level),
        createdAt: new Date().toISOString(),
        ...doc.soal,
      };
      store.insert('soal', full);
      hasil.created++;
      hasil.perType[tipe] = (hasil.perType[tipe] || 0) + 1;
    }
  };

  // ---- Pilihan Ganda ----
  proses('PG', 'PG', (row, p) => {
    const opsi = ['A', 'B', 'C', 'D', 'E'].map((L) => String(row[L] ?? '').trim()).filter(Boolean);
    const kunci = String(row.Kunci ?? row['Kunci (A-E)'] ?? '').trim().toUpperCase();
    if (opsi.length < 2) return { error: 'Opsi kurang dari 2' };
    if (!/^[A-E]$/.test(kunci)) return { error: 'Kunci harus huruf A-E' };
    if (kunci.charCodeAt(0) - 65 >= opsi.length) return { error: 'Kunci menunjuk opsi kosong' };
    return { soal: { tipe: 'PG', pertanyaan: p, opsi, kunci, skor: cekSkor(row.Skor, 5), kunciPoin: '' } };
  });

  // ---- Benar / Salah ----
  proses('BS', 'BS', (row, p) => {
    const kunci = String(row.Kunci ?? row['Kunci (BENAR/SALAH)'] ?? '').trim().toUpperCase();
    if (!['BENAR', 'SALAH'].includes(kunci)) return { error: 'Kunci harus BENAR/SALAH' };
    return { soal: { tipe: 'BS', pertanyaan: p, kunci, skor: cekSkor(row.Skor, 5), kunciPoin: '' } };
  });

  // ---- Menjodohkan ----
  proses('MENJODOKAN', 'MENJODOKAN', (row, p) => {
    const kiri = [1, 2, 3, 4].map((n) => String(row['Kiri' + n] ?? '').trim()).filter(Boolean);
    const kanan = [1, 2, 3, 4].map((n) => String(row['Kanan' + n] ?? '').trim()).filter(Boolean);
    if (kiri.length < 2) return { error: 'Kiri kurang dari 2 pasangan' };
    if (kanan.length < kiri.length) return { error: 'Jumlah kanan < kiri' };
    const kunci = parseKunciJodoh(row.Kunci ?? row['Kunci (1-A;2-B;3-C)'], kiri.length, kanan.length);
    if (!kunci) return { error: 'Format kunci salah (contoh benar: 1-A;2-B;3-C)' };
    return { soal: { tipe: 'MENJODOKAN', pertanyaan: p, kiri, kanan, kunci, skor: cekSkor(row.Skor, 10), kunciPoin: '' } };
  });

  // ---- Essay ----
  proses('ESSAY', 'ESSAY', (row, p) => ({
    soal: { tipe: 'ESSAY', pertanyaan: p, kunciPoin: String(row.Rubrik || '').trim(), skor: cekSkor(row.Skor, 10) },
  }));

  return ok(hasil);
}
