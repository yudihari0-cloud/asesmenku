import { TIPE_SOAL } from './grade';

/** Helper komputasi tingkat asesmen */

/** Susun paket soal dari kisi-kisi: ambil soal bank per indikator sesuai jumlah */
export function composeSoal(kisi, bankSoal, acak = true) {
  const ids = [];
  for (const item of kisi.items || []) {
    let kandidat = bankSoal.filter((s) => s.kisiItemId === item.id);
    if (acak) kandidat = shuffle(kandidat);
    ids.push(...kandidat.slice(0, item.jumlah || 0).map((s) => s.id));
  }
  return ids;
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const r2 = (n) => Math.round(n * 100) / 100;

/**
 * Rekap lengkap satu asesmen:
 * rows  = per siswa (nilai & status KKTP)
 * mastery = penguasaan kelas per indikator kisi-kisi
 */
export function hitungRekap(asesmen, kisi, soalList, attempts, siswaList, kelasList) {
  const soalMap = Object.fromEntries(soalList.map((s) => [s.id, s]));
  const kelasMap = Object.fromEntries(kelasList.map((k) => [k.id, k.nama]));
  const attemptPerSiswa = {};
  for (const at of attempts) attemptPerSiswa[at.siswaId] = at;

  const rows = siswaList.map((sw) => {
    const at = attemptPerSiswa[sw.id];
    let skor = null;
    let essayPending = false;
    let statusLabel = 'Belum mengikuti';
    if (at) {
      skor = at.skorAkhir ?? at.skorObjektif;
      if (at.status === 'selesai') {
        // essay belum dikoreksi guru
        essayPending = true;
        statusLabel = 'Menunggu koreksi essay';
      } else if (skor != null) {
        statusLabel = skor >= asesmen.kktp ? 'Tuntas' : 'Belum tuntas';
      }
    }
    return {
      siswaId: sw.id,
      nama: sw.nama,
      nisn: sw.nisn || '-',
      wa: sw.wa || '',
      kelas: kelasMap[sw.kelasId] || '-',
      attemptId: at?.id || null,
      status: at?.status || 'belum',
      skor,
      essayPending,
      statusLabel,
    };
  });

  // Penguasaan per indikator kisi-kisi
  const agg = {};
  for (const at of attempts) {
    if (!at.perSoal) continue;
    for (const [sid, v] of Object.entries(at.perSoal)) {
      const so = soalMap[sid];
      if (!so) continue;
      const key = so.kisiItemId || '_';
      agg[key] = agg[key] || { dapat: 0, max: 0 };
      agg[key].dapat += v.dapat || 0;
      agg[key].max += v.max || 0;
    }
  }
  const mastery = (kisi.items || []).map((it) => {
    const a = agg[it.id] || { dapat: 0, max: 0 };
    const persen = a.max ? r2((a.dapat / a.max) * 100) : 0;
    const kategori = persen >= 75 ? 'Tuntas' : persen >= 50 ? 'Perlu penguatan' : 'Remedial';
    return { itemId: it.id, indikator: it.indikator, materi: it.materi, level: it.level, bentuk: it.bentuk, persen, kategori };
  });

  const peserta = rows.filter((r) => r.status !== 'belum');
  const skorValid = peserta.filter((r) => r.skor != null).map((r) => r.skor);
  const ringkas = {
    jumlahSiswa: rows.length,
    jumlahPeserta: peserta.length,
    rata: skorValid.length ? r2(skorValid.reduce((a, b) => a + b, 0) / skorValid.length) : null,
    tertinggi: skorValid.length ? Math.max(...skorValid) : null,
    terendah: skorValid.length ? Math.min(...skorValid) : null,
    tuntas: skorValid.filter((s) => s >= asesmen.kktp).length,
    menungguKoreksi: peserta.filter((r) => r.essayPending).length,
  };
  return { rows, mastery, ringkas };
}

/** Soal aman untuk dikirim ke siswa (tanpa kunci) */
export function sanitizeSoal(soal) {
  return {
    id: soal.id,
    tipe: soal.tipe,
    pertanyaan: soal.pertanyaan,
    gambar: soal.gambar || null,
    opsi: soal.opsi || null,
    kiri: soal.kiri || null,
    kanan: soal.kanan || null,
    skor: soal.skor,
    level: soal.level,
  };
}

export { TIPE_SOAL };
