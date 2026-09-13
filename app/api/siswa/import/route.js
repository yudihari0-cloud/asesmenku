import * as XLSX from 'xlsx';
import { ctx, ok, bad, requireUser, safeUser } from '@/lib/api';
import { hashPw } from '@/lib/auth';
import { id } from '@/lib/ids';

const ROMAN_FASE = { I: 'A', II: 'A', III: 'B', IV: 'B', V: 'C', VI: 'C', VII: 'D', VIII: 'D', IX: 'D', X: 'E', XI: 'F', XII: 'F' };

function faseDariKelas(nama) {
  const m = String(nama).toUpperCase().match(/(XII|XI|X|IX|VIII|VII|VI|V|IV|III|II|I)/);
  return m ? ROMAN_FASE[m[1]] || 'D' : 'D';
}

function normalWa(v) {
  let wa = String(v || '').replace(/\D/g, '');
  if (wa.startsWith('0')) wa = '62' + wa.slice(1);
  else if (wa.startsWith('8')) wa = '62' + wa;
  return wa.length >= 9 ? wa : '';
}

/** POST multipart/form-data {file} — import siswa dari Excel template */
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
    const buf = Buffer.from(await file.arrayBuffer());
    const wb = XLSX.read(buf);
    const ws = wb.Sheets[wb.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
  } catch {
    return bad('File tidak dapat dibaca. Gunakan template .xlsx yang disediakan.');
  }

  const users = await store.list('users');
  const kelasList = await store.list('kelas');
  let created = 0;
  const skipped = [];
  const kelasBaru = [];

  for (const row of rows) {
    const nama = String(row.Nama || row.nama || '').trim();
    const nisn = String(row.NISN || row.nisn || '').trim();
    const kelasNama = String(row.Kelas || row.kelas || '').trim();
    const wa = normalWa(row['No. WA'] || row.NoWA || row.wa || row.WA);
    if (!nama || !nisn) {
      skipped.push({ nama: nama || '(tanpa nama)', alasan: 'Nama/NISN kosong' });
      continue;
    }
    if (users.some((u) => u.nisn === nisn)) {
      skipped.push({ nama, alasan: 'NISN sudah terdaftar' });
      continue;
    }
    // Cari kelas (dalam sekolah yang sama); buat otomatis bila belum ada
    let kelas = kelasList.find((k) => (k.sekolahId || 'demo') === (user.sekolahId || 'demo') && k.nama.toLowerCase() === kelasNama.toLowerCase());
    if (!kelas && kelasNama) {
      kelas = {
        id: id('k'),
        nama: kelasNama,
        tingkat: 0,
        fase: faseDariKelas(kelasNama),
        sekolahId: user.sekolahId || 'demo',
        guruId: user.id,
      };
      kelasList.push(kelas);
      kelasBaru.push(kelasNama);
      await store.insert('kelas', kelas);
    }
    const doc = {
      id: id('sw'),
      role: 'siswa',
      nama,
      username: nisn,
      nisn,
      kelasId: kelas ? kelas.id : '',
      wa,
      sekolahId: user.sekolahId || 'demo',
      pwHash: hashPw('123456'),
      createdAt: new Date().toISOString(),
    };
    await store.insert('users', doc);
    users.push(doc);
    created++;
  }

  return ok({ created, skipped, kelasBaru });
}
