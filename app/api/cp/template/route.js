import * as XLSX from 'xlsx';
import { ctx, bad, requireUser } from '@/lib/api';
import { xlsxResponse } from '@/lib/excel';

/** GET /api/cp/template — template Excel master CP semua jenjang (Fase A–F) */
export async function GET(req) {
  const { user } = await ctx(req);
  const gate = requireUser(user, ['guru', 'admin']);
  if (gate) return gate;

  const wb = XLSX.utils.book_new();

  const petunjuk = XLSX.utils.aoa_to_sheet([
    ['PETUNJUK IMPORT MASTER CAPAIAN PEMBELAJARAN (CP)'],
    [''],
    ['Sumber resmi: Keputusan Kepala BSKAP No. 046/H/KR/2025 tentang Capaian Pembelajaran'],
    ['(16 Juli 2025) — teks CP lengkap tersedia melalui Dashboard Merdeka Mengajar / laman'],
    ['Kemendikdasmen, atau buku saku CP yang beredar.'],
    [''],
    ['Panduan mengisi sheet "CP":'],
    ['1. Satu baris = satu CP untuk satu elemen pada satu mapel & fase.'],
    ['2. Fase diisi huruf: A (SD kelas I-II), B (III-IV), C (V-VI), D (SMP VII-IX), E (SMA X), F (XI-XII).'],
    ['3. Kolom Kode opsional (mis. M.D.A); Teks CP wajib — salin dari dokumen resmi.'],
    ['4. Baris yang diawali kata CONTOH akan dilewati saat import — hapus atau biarkan.'],
    ['5. CP yang sudah terdaftar (fase+mapel+elemen+kode sama) otomatis dilewati.'],
    ['6. Setelah import, CP muncul di dropdown "Elemen & CP" pada Kisi-Kisi Maker.'],
  ]);
  petunjuk['!cols'] = [{ wch: 95 }];
  XLSX.utils.book_append_sheet(wb, petunjuk, 'Petunjuk');

  const ws = XLSX.utils.aoa_to_sheet([
    ['Fase', 'Mapel', 'Elemen', 'Kode', 'Teks CP', 'Sumber'],
    ['CONTOH', 'Bahasa Indonesia', 'Menyimak', 'BI.A.M', 'CONTOH — Di akhir fase A, peserta didik mampu memahami dan merespons teks lisan sederhana ... (salin teks resmi di sini)', 'BSKAP 046/H/KR/2025'],
    ['CONTOH', 'Matematika', 'Bilangan', 'M.C.B', 'CONTOH — Di akhir fase C, peserta didik dapat membaca, menulis, membandingkan, dan mengurutkan bilangan cacah ... (salin teks resmi di sini)', 'BSKAP 046/H/KR/2025'],
    ['CONTOH', 'Fisika', 'Energi dan Perubahannya', 'FIS.E.P', 'CONTOH — Di akhir fase E, peserta didik dapat menganalisis usaha dan energi ... (salin teks resmi di sini)', 'BSKAP 046/H/KR/2025'],
    ['CONTOH', 'Pendidikan Pancasila', 'Pancasila', 'PP.A.P', 'CONTOH — Peserta didik mampu mengenal dan mempraktikkan nilai-nilai Pancasila ... (salin teks resmi di sini)', 'BSKAP 046/H/KR/2025'],
  ]);
  ws['!cols'] = [{ wch: 6 }, { wch: 22 }, { wch: 26 }, { wch: 10 }, { wch: 80 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(wb, ws, 'CP');

  return xlsxResponse(wb, 'template_import_cp_semua_jenjang.xlsx');
}
