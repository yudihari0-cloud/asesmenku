import * as XLSX from 'xlsx';

/** Helper pembuatan file Excel (template siswa/soal, export kisi-kisi, export rekap) */

const HEADERS = {
  'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

function xlsxResponse(wb, filename) {
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return new Response(new Uint8Array(buf), {
    headers: { ...HEADERS, 'Content-Disposition': `attachment; filename="${filename}"` },
  });
}

/** Template import siswa: Nama | NISN | Kelas | No. WA */
export function templateSiswa() {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([
    ['Nama', 'NISN', 'Kelas', 'No. WA'],
    ['Budi Santoso', '0091234501', 'VIII-A', '081234567890'],
    ['Siti Aminah', '0091234502', 'VIII-A', ''],
  ]);
  ws['!cols'] = [{ wch: 30 }, { wch: 16 }, { wch: 12 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Siswa');

  const petunjuk = XLSX.utils.aoa_to_sheet([
    ['PETUNJUK IMPORT SISWA'],
    [''],
    ['1. Isi data siswa pada sheet "Siswa" mulai baris ke-2 (jangan ubah judul kolom).'],
    ['2. NISN harus unik — NISN sama akan dilewati otomatis.'],
    ['3. Kolom "Kelas" diisi nama kelas, mis. VIII-A. Jika kelas belum ada, dibuat otomatis.'],
    ['4. Kolom "No. WA" opsional (mis. 081234567890) — dipakai untuk tombol kirim pengumuman ujian via WhatsApp.'],
    ['5. Password awal setiap siswa: 123456 (bisa digunakan langsung untuk login).'],
    ['6. Simpan file (format .xlsx) lalu unggah pada halaman Kelas & Siswa.'],
  ]);
  ws['!cols'] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(wb, petunjuk, 'Petunjuk');
  return xlsxResponse(wb, 'template_import_siswa.xlsx');
}

const BENTUK_LABEL = { PG: 'Pilihan Ganda', BS: 'Benar/Salah', MENJODOKAN: 'Menjodohkan', ESSAY: 'Essay' };

/** Template import bank soal massal — 1 sheet per tipe soal + daftar indikator kisi */
export function soalTemplateXlsx(kisi = null) {
  const wb = XLSX.utils.book_new();

  const petunjuk = XLSX.utils.aoa_to_sheet([
    ['PETUNJUK IMPORT BANK SOAL'],
    [''],
    ['1. Isi soal pada sheet sesuai tipenya: PG, BS, MENJODOKAN, atau ESSAY (boleh semua sekaligus).'],
    ['2. Baris yang diawali kata CONTOH akan diabaikan saat import — hapus atau biarkan.'],
    ['3. Kolom IndikatorNo = nomor indikator pada sheet "Indikator" (dari kisi-kisi terpilih). Kosongkan bila tidak menautkan.'],
    ['4. Level diisi L1 / L2 / L3. Skor berupa angka.'],
    ['5. MENJODOKAN: pasangan kiri-kanan sejajar; kolom Kunci opsional format "1-A;2-B;3-C" (kosong = berurutan). Pilihan kanan boleh lebih banyak sebagai pengecoh.'],
    ['6. Kolom "Gambar (URL)" opsional — tempel URL gambar publik (mis. dari Google Drive yang dibagikan/publik, situs sekolah, dll).'],
    ['7. Simpan sebagai .xlsx lalu unggah kembali di halaman Bank Soal.'],
  ]);
  XLSX.utils.book_append_sheet(wb, petunjuk, 'Petunjuk');

  const ind = [['No', 'Lingkup Materi', 'Indikator Soal', 'Bentuk', 'Level']];
  (kisi?.items || []).forEach((it, i) => ind.push([i + 1, it.materi || '-', it.indikator || '-', BENTUK_LABEL[it.bentuk] || it.bentuk, it.level || '-']));
  const wsInd = XLSX.utils.aoa_to_sheet(ind);
  wsInd['!cols'] = [{ wch: 4 }, { wch: 28 }, { wch: 60 }, { wch: 14 }, { wch: 8 }];
  XLSX.utils.book_append_sheet(wb, wsInd, 'Indikator');

  const wsPG = XLSX.utils.aoa_to_sheet([
    ['Pertanyaan', 'A', 'B', 'C', 'D', 'E', 'Kunci (A-E)', 'Skor', 'Level', 'IndikatorNo', 'Gambar (URL)'],
    ['CONTOH — Ibu kota Provinsi Jawa Timur adalah ...', 'Surabaya', 'Malang', 'Semarang', 'Bandung', '', 'A', 5, 'L1', 1, ''],
  ]);
  wsPG['!cols'] = [{ wch: 45 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 12 }, { wch: 6 }, { wch: 7 }, { wch: 12 }, { wch: 24 }];
  XLSX.utils.book_append_sheet(wb, wsPG, 'PG');

  const wsBS = XLSX.utils.aoa_to_sheet([
    ['Pertanyaan', 'Kunci (BENAR/SALAH)', 'Skor', 'Level', 'IndikatorNo', 'Gambar (URL)'],
    ['CONTOH — Surabaya adalah ibu kota Provinsi Jawa Timur.', 'BENAR', 5, 'L1', 1, ''],
  ]);
  wsBS['!cols'] = [{ wch: 55 }, { wch: 20 }, { wch: 6 }, { wch: 7 }, { wch: 12 }, { wch: 24 }];
  XLSX.utils.book_append_sheet(wb, wsBS, 'BS');

  const wsMj = XLSX.utils.aoa_to_sheet([
    ['Pertanyaan', 'Kiri1', 'Kiri2', 'Kiri3', 'Kiri4', 'Kanan1', 'Kanan2', 'Kanan3', 'Kanan4', 'Kunci (1-A;2-B;3-C)', 'Skor', 'Level', 'IndikatorNo'],
    ['CONTOH — Jodohkan propinsi dengan ibu kotanya!', 'Jawa Timur', 'Jawa Tengah', 'Jawa Barat', '', 'Surabaya', 'Semarang', 'Bandung', 'Medan', '1-A;2-B;3-C', 10, 'L1', 1],
  ]);
  wsMj['!cols'] = [{ wch: 32 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 18 }, { wch: 6 }, { wch: 7 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, wsMj, 'MENJODOKAN');

  const wsEs = XLSX.utils.aoa_to_sheet([
    ['Pertanyaan', 'Rubrik', 'Skor', 'Level', 'IndikatorNo', 'Gambar (URL)'],
    ['CONTOH — Jelaskan proses pencernaan pada manusia!', 'Model benar (5), urutan proses (10), istilah (5)', 20, 'L2', 1, ''],
  ]);
  wsEs['!cols'] = [{ wch: 50 }, { wch: 45 }, { wch: 6 }, { wch: 7 }, { wch: 12 }, { wch: 24 }];
  XLSX.utils.book_append_sheet(wb, wsEs, 'ESSAY');

  return xlsxResponse(wb, 'template_import_bank_soal.xlsx');
}

/** Export kisi-kisi ke Excel (dengan identitas sekolah & guru) */
export function kisiXlsx(kisi, meta = {}) {
  const wb = XLSX.utils.book_new();
  const judul = [
    ['KISI-KISI PENULISAN SOAL ASESMEN'],
    [meta.sekolah || '', meta.guru ? `Guru penyusun: ${meta.guru}${meta.nip ? ` (NIP ${meta.nip})` : ''}` : ''],
    [kisi.judul],
    [`Mata Pelajaran: ${kisi.mapel}    Fase: ${kisi.fase}    Kelas: ${kisi.kelas}`],
    [`Tujuan Pembelajaran: ${kisi.tp || '-'}`],
    [''],
    ['No', 'Elemen/CP', 'Capaian Pembelajaran (ringkas)', 'Lingkup Materi', 'Indikator Soal', 'Level Kognitif', 'Bentuk Soal', 'Jumlah Soal', 'Bobot'],
  ];
  const rows = kisi.items.map((it, i) => [
    i + 1,
    it.elemen || '-',
    (it.cpTeks || '-').slice(0, 220),
    it.materi || '-',
    it.indikator || '-',
    it.level || '-',
    BENTUK_LABEL[it.bentuk] || it.bentuk,
    it.jumlah || 0,
    it.bobot || 0,
  ]);
  const total = ['TOTAL', '', '', '', '', '', '', kisi.items.reduce((a, b) => a + (b.jumlah || 0), 0), kisi.items.reduce((a, b) => a + (b.bobot || 0), 0)];
  const ws = XLSX.utils.aoa_to_sheet([...judul, ...rows, total]);
  ws['!cols'] = [{ wch: 4 }, { wch: 14 }, { wch: 50 }, { wch: 24 }, { wch: 55 }, { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 8 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Kisi-Kisi');
  return xlsxResponse(wb, `kisi_kisi_${(kisi.mapel || 'mapel').replace(/\s+/g, '_')}.xlsx`);
}

/** Export rekap hasil asesmen (nilai + analisis indikator + analisis butir) */
export function rekapXlsx({ asesmen, rows, mastery, butir = [] }) {
  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.aoa_to_sheet([
    ['REKAP HASIL ASESMEN'],
    [asesmen.judul],
    [`KKTP: ${asesmen.kktp}`],
    [''],
    ['No', 'Nama', 'NISN', 'Kelas', 'Skor', 'Status'],
    ...rows.map((r, i) => [i + 1, r.nama, r.nisn, r.kelas, r.skor ?? '-', r.statusLabel]),
  ]);
  ws1['!cols'] = [{ wch: 4 }, { wch: 28 }, { wch: 14 }, { wch: 10 }, { wch: 8 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Rekap Nilai');

  const ws2 = XLSX.utils.aoa_to_sheet([
    ['ANALISIS PENGUASAAN PER INDIKATOR KISI-KISI'],
    [''],
    ['No', 'Indikator', 'Level', 'Bentuk', '% Penguasaan Kelas', 'Kategori'],
    ...mastery.map((m, i) => [i + 1, m.indikator, m.level, BENTUK_LABEL[m.bentuk] || m.bentuk, m.persen + '%', m.kategori]),
  ]);
  ws2['!cols'] = [{ wch: 4 }, { wch: 60 }, { wch: 8 }, { wch: 14 }, { wch: 18 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Analisis Indikator');

  if (butir.length) {
    const ws3 = XLSX.utils.aoa_to_sheet([
      ['ANALISIS BUTIR SOAL'],
      ['P = tingkat kesukaran (0-1) · D = daya beda (atas 27% - bawah 27%)'],
      [''],
      ['No', 'Soal', 'Tipe', 'N', 'P', 'Kesukaran', 'D', 'Daya Beda', 'Sebaran Jawaban'],
      ...butir.map((b, i) => [
        i + 1,
        b.pertanyaan.slice(0, 80),
        BENTUK_LABEL[b.tipe] || b.tipe,
        b.N,
        b.P ?? '-',
        b.kesukaran,
        b.D ?? '-',
        b.dayaBeda,
        b.pengecoh ? Object.entries(b.pengecoh.dist).map(([k, v]) => `${k}:${v}`).join(' ') : '-',
      ]),
    ]);
    ws3['!cols'] = [{ wch: 4 }, { wch: 50 }, { wch: 13 }, { wch: 5 }, { wch: 6 }, { wch: 11 }, { wch: 6 }, { wch: 11 }, { wch: 28 }];
    XLSX.utils.book_append_sheet(wb, ws3, 'Analisis Butir');
  }
  return xlsxResponse(wb, `rekap_${asesmen.judul.slice(0, 30).replace(/[^\w]+/g, '_')}.xlsx`);
}

/** Export rapor mini per siswa (nilai lintas asesmen + penguasaan indikator) */
export function raporXlsx({ siswa, kelasNama, rows, mastery, ringkas }) {
  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.aoa_to_sheet([
    ['RAPOR MINI ASESMEN'],
    [siswa.nama],
    [`Kelas: ${kelasNama}    NISN: ${siswa.nisn || '-'}`],
    [`Rata-rata: ${ringkas.rata ?? '-'}    Asesmen diikuti: ${ringkas.ikut}    Tuntas: ${ringkas.tuntas}`],
    [''],
    ['No', 'Asesmen', 'Mapel', 'Skor', 'KKTP', 'Status', 'Selesai'],
    ...rows.map((r, i) => [i + 1, r.judul, r.mapel, r.skor ?? '-', r.kktp, r.statusLabel, r.selesai ? new Date(r.selesai).toLocaleString('id-ID') : '-']),
  ]);
  ws1['!cols'] = [{ wch: 4 }, { wch: 45 }, { wch: 16 }, { wch: 8 }, { wch: 6 }, { wch: 16 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Nilai');

  const ws2 = XLSX.utils.aoa_to_sheet([
    ['PENGUASAAN INDIKATOR (agregat lintas asesmen)'],
    [''],
    ['No', 'Kisi-Kisi', 'Mapel', 'Indikator', 'Level', '% Penguasaan', 'Kategori'],
    ...mastery.map((m, i) => [i + 1, m.kisiJudul, m.mapel, m.indikator, m.level, m.persen + '%', m.kategori]),
  ]);
  ws2['!cols'] = [{ wch: 4 }, { wch: 32 }, { wch: 14 }, { wch: 55 }, { wch: 8 }, { wch: 14 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Penguasaan');
  return xlsxResponse(wb, `rapor_${(siswa.nama || 'siswa').replace(/[^\w]+/g, '_')}.xlsx`);
}

export { xlsxResponse };
