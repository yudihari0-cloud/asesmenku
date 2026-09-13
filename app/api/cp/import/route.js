import * as XLSX from 'xlsx';
import { ctx, ok, bad, requireUser } from '@/lib/api';
import { id } from '@/lib/ids';

const FASE_OK = new Set(['A', 'B', 'C', 'D', 'E', 'F']);

/** POST multipart {file} — import master CP (BSKAP 046/H/KR/2025) dari Excel */
export async function POST(req) {
  const { store, user } = await ctx(req);
  const gate = requireUser(user, ['guru', 'admin']);
  if (gate) return gate;

  let file;
  try {
    const fd = await req.formData();
    file = fd.get('file');
  } catch {
    return bad('Unggahan tidak terbaca');
  }
  if (!file) return bad('Pilih file Excel terlebih dahulu');

  let rows;
  try {
    const wb = XLSX.read(Buffer.from(await file.arrayBuffer()));
    const ws = wb.Sheets['CP'] || wb.Sheets[wb.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
  } catch {
    return bad('File tidak dapat dibaca. Gunakan template yang disediakan.');
  }

  const lama = await store.list('cp');
  const hasil = { created: 0, skipped: [] };
  const skip = (m, alasan) => hasil.skipped.push({ mapel: String(m || '-').slice(0, 40), alasan });

  for (const row of rows) {
    const fase = String(row.Fase || row.fase || '').trim().toUpperCase();
    const mapel = String(row.Mapel || row.mapel || '').trim();
    const elemen = String(row.Elemen || row.elemen || '').trim();
    const kode = String(row.Kode || row.kode || '').trim();
    const teks = String(row['Teks CP'] || row.Teks || row.teks || '').trim();
    const sumber = String(row.Sumber || row.sumber || '').trim() || 'BSKAP 046/H/KR/2025';

    if (!teks || !mapel) continue;
    if (/^contoh/i.test(teks) || /^contoh/i.test(kode)) continue;
    if (!FASE_OK.has(fase)) { skip(mapel, 'Fase tidak valid (harus A-F)'); continue; }

    const duplikat = lama.some(
      (c) => c.fase === fase && c.mapel === mapel && c.elemen === elemen && (kode ? c.kode === kode : c.teks === teks)
    );
    if (duplikat) { skip(mapel + ' · ' + elemen, 'Sudah terdaftar'); continue; }

    const doc = { id: id('cp'), fase, mapel, elemen, kode, teks, sumber };
    await store.insert('cp', doc);
    lama.push(doc);
    hasil.created++;
  }

  return ok(hasil);
}
