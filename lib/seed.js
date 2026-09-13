import { id, token } from './ids';
import { hashPw } from './auth';

/**
 * Data demo awal — dibuat otomatis saat database masih kosong.
 * CP di bawah adalah RINGKASAN dari BSKAP 046/H/KR/2025 untuk contoh;
 * lengkapnya dapat diimpor dari dokumen resmi ke tab "cp".
 */

const SUMBER = 'BSKAP 046/H/KR/2025 (ringkasan)';

const CP_SEED = [
  { fase: 'D', mapel: 'Matematika', elemen: 'Bilangan', kode: 'M.D.B', teks: 'Di akhir fase D, peserta didik dapat membaca, menulis, dan membandingkan bilangan bulat, bilangan rasional dan irasional, bilangan desimal, bilangan berpangkat bulat dan akar, bilangan dalam notasi ilmiah; menggunakan faktorisasi prima dan pengertian rasio (skala, proporsi, dan laju perubahan) dalam penyelesaian masalah.', sumber: SUMBER },
  { fase: 'D', mapel: 'Matematika', elemen: 'Aljabar', kode: 'M.D.A', teks: 'Di akhir fase D, peserta didik dapat menggunakan faktorisasi, ekspansi, penyederhanaan, penjumlahan, pengurangan, perkalian, pembagian, dan konjugat pada ekspresi aljabar, serta memahami struktur aljabar dan relasi ke setiap nomor pada sistem bilangan real; memahami dan menggunakan hubungan antara variabel dalam persamaan dan pertidaksamaan linear untuk menyelesaikan masalah kontekstual.', sumber: SUMBER },
  { fase: 'D', mapel: 'Matematika', elemen: 'Pengukuran', kode: 'M.D.P', teks: 'Di akhir fase D, peserta didik dapat menggunakan perbandingan dan perkalian skala faktor untuk menyelesaikan masalah berkaitan dengan kongruensi dan kesebangunan bangun datar serta segitiga siku-siku (trigonometri dasar).', sumber: SUMBER },
  { fase: 'D', mapel: 'Matematika', elemen: 'Geometri', kode: 'M.D.G', teks: 'Di akhir fase D, peserta didik dapat mengklasifikasikan bangun datar dan bangun ruang berdasarkan sisi dan sudutnya; menggunakan teorema Pythagoras untuk menyelesaikan masalah.', sumber: SUMBER },
  { fase: 'D', mapel: 'Matematika', elemen: 'Analisis Data dan Peluang', kode: 'M.D.AD', teks: 'Di akhir fase D, peserta didik dapat memperoleh, mengolah, mempresentasikan, menafsirkan, dan menganalisis data tunggal dalam berbagai representasi untuk memecahkan masalah kontekstual dan komunikatif.', sumber: SUMBER },
  { fase: 'D', mapel: 'Bahasa Indonesia', elemen: 'Menyimak', kode: 'BI.D.M', teks: 'Di akhir fase D, peserta didik dapat memahami ide pokok, ide penjelas, dan fakta penting dari teks nonfiksi maupun fiksi yang didengar/diputar, termasuk dari penyampaian informasi melalui media digital.', sumber: SUMBER },
  { fase: 'D', mapel: 'Bahasa Indonesia', elemen: 'Membaca dan Memirsa', kode: 'BI.D.BM', teks: 'Di akhir fase D, peserta didik dapat memahami dan mengevaluasi gagasan tersurat dan tersirat, fakta dan opini pada teks literasi informasi (berita, artikelpopuler, dan lainnya) dan literasi transaksional.', sumber: SUMBER },
  { fase: 'D', mapel: 'Bahasa Indonesia', elemen: 'Menulis', kode: 'BI.D.W', teks: 'Di akhir fase D, peserta didik dapat menghasilkan teks narasi, eksposisi, dan teks jawaban atas pertanyaan yang menggunakan struktur dan kaidah kebahasaan yang tepat dan kreatif.', sumber: SUMBER },
  { fase: 'D', mapel: 'IPA', elemen: 'Pemahaman IPA', kode: 'IPA.D.P', teks: 'Di akhir fase D, peserta didik dapat memahami sistem organ tubuh manusia, zat dan perubahannya, energi dan perubahannya, serta makhluk hidup dan lingkungannya; menerapkan keterampilan proses sains untuk menyelidiki masalah sehari-hari.', sumber: SUMBER },
];

const NAMA_8A = ['Ahmad Fauzi', 'Bunga Lestari', 'Citra Ayu', 'Dimas Prakoso', 'Eka Putri', 'Farhan Maulana', 'Gita Rahayu', 'Hendra Saputra', 'Intan Permatasari', 'Joko Susilo', 'Kirana Dewi', 'Lutfi Ramadhan'];
const NAMA_8B = ['Maya Anggraini', 'Nadia Safitri', 'Oscar Pratama', 'Putri Amelia', 'Qori Handayani', 'Rizky Nugraha', 'Salsabila Putri', 'Tegar Wicaksono', 'Umi Kalsum', 'Vino Bastian', 'Wulan Sari', 'Yoga Pratama'];

const r2 = (n) => Math.round(n * 100) / 100;

function buatSiswa(nama, kelasId, no) {
  const nisn = String(61234501 + no).padStart(10, '0');
  return {
    id: id('sw'),
    role: 'siswa',
    nama,
    username: nisn,
    nisn,
    kelasId,
    sekolahId: 'demo',
    pwHash: hashPw('123456'),
    createdAt: new Date().toISOString(),
  };
}

export async function seedDemo(store) {
  const now = Date.now();
  const iso = (offsetMs = 0) => new Date(now + offsetMs).toISOString();

  // ===== Sekolah demo =====
  await store.insert('sekolah', { id: 'demo', nama: 'SMP Tunas Bangsa', alamat: 'Jl. Pendidikan No. 17, Surabaya', logo: '', createdAt: iso() });

  // ===== Guru =====
  const guru = {
    id: id('g'),
    role: 'guru',
    nama: 'Yudi Ahari Siswanto, S.Pd.',
    username: 'yudi',
    sekolahId: 'demo',
    nip: '19850512 201003 2 004',
    jabatan: 'Guru Matematika · Wali Kelas VIII',
    wa: '',
    foto: '',
    pwHash: hashPw('guru123'),
    createdAt: iso(),
  };
  await store.insert('users', guru);

  // ===== CP (master CP 046) =====
  for (const c of CP_SEED) await store.insert('cp', { id: id('cp'), ...c });

  // ===== Kelas & siswa =====
  const kelasA = { id: id('k'), nama: 'VIII-A', tingkat: 8, fase: 'D', sekolahId: 'demo', guruId: guru.id };
  const kelasB = { id: id('k'), nama: 'VIII-B', tingkat: 8, fase: 'D', sekolahId: 'demo', guruId: guru.id };
  await store.insert('kelas', kelasA);
  await store.insert('kelas', kelasB);

  const siswaA = NAMA_8A.map((n, i) => buatSiswa(n, kelasA.id, i));
  const siswaB = NAMA_8B.map((n, i) => buatSiswa(n, kelasB.id, NAMA_8A.length + i));
  for (const s of [...siswaA, ...siswaB]) await store.insert('users', s);

  // ===== Kisi-kisi =====
  const cpAljabar = (await store.list('cp')).find((c) => c.elemen === 'Aljabar' && c.mapel === 'Matematika');
  const items = [
    { id: id('it'), elemen: 'Aljabar', cpId: cpAljabar?.id || '', cpTeks: cpAljabar?.teks || '', materi: 'Persamaan Linear Satu Variabel', indikator: 'Disajikan masalah sehari-hari, peserta didik dapat menentukan penyelesaian persamaan linear satu variabel', level: 'L1', bentuk: 'PG', jumlah: 2, bobot: 10 },
    { id: id('it'), elemen: 'Aljabar', cpId: cpAljabar?.id || '', cpTeks: cpAljabar?.teks || '', materi: 'SPLDV — Metode Substitusi', indikator: 'Peserta didik dapat menentukan himpunan penyelesaian SPLDV dengan metode substitusi', level: 'L2', bentuk: 'PG', jumlah: 3, bobot: 15 },
    { id: id('it'), elemen: 'Aljabar', cpId: cpAljabar?.id || '', cpTeks: cpAljabar?.teks || '', materi: 'SPLDV — Sifat Penyelesaian', indikator: 'Peserta didik dapat menentukan benar/salah pernyataan tentang penyelesaian SPLDV', level: 'L1', bentuk: 'BS', jumlah: 3, bobot: 10 },
    { id: id('it'), elemen: 'Aljabar', cpId: cpAljabar?.id || '', cpTeks: cpAljabar?.teks || '', materi: 'SPLDV — Model Matematika', indikator: 'Peserta didik dapat menjodohkan model matematika SPLDV dengan masalah kontekstual dan solusinya', level: 'L1', bentuk: 'MENJODOKAN', jumlah: 1, bobot: 10 },
    { id: id('it'), elemen: 'Aljabar', cpId: cpAljabar?.id || '', cpTeks: cpAljabar?.teks || '', materi: 'SPLDV — Masalah Kontekstual', indikator: 'Peserta didik dapat menyelesaikan masalah kontekstual yang melibatkan SPLDV dan menyimpulkan hasilnya', level: 'L3', bentuk: 'ESSAY', jumlah: 2, bobot: 30 },
    { id: id('it'), elemen: 'Aljabar', cpId: cpAljabar?.id || '', cpTeks: cpAljabar?.teks || '', materi: 'SPLDV — Menyusun Model', indikator: 'Peserta didik dapat menyusun model SPLDV dari kasus belanja sehari-hari lalu menyelesaikannya', level: 'L2', bentuk: 'ESSAY', jumlah: 1, bobot: 25 },
  ];
  const kisi = {
    id: id('kk'),
    guruId: guru.id,
    judul: 'Kisi-Kisi Sumatif Tengah Semester — Matematika VIII',
    mapel: 'Matematika',
    fase: 'D',
    kelas: 'VIII',
    tp: 'Peserta didik dapat memahami dan menggunakan hubungan antarvariabel dalam persamaan linear untuk menyelesaikan masalah kontekstual.',
    items,
    createdAt: iso(-14 * 864e5),
  };
  await store.insert('kisi', kisi);

  // ===== Bank soal (tertaut ke indikator kisi-kisi) =====
  const [it1, it2, it3, it4, it5, it6] = items;
  const soalSeed = [
    { kisiItemId: it1.id, tipe: 'PG', pertanyaan: 'Nilai x yang memenuhi persamaan 3x + 5 = 20 adalah ...', opsi: ['5', '4', '6', '3'], kunci: 'A', skor: 5, level: 'L1' },
    { kisiItemId: it1.id, tipe: 'PG', pertanyaan: 'Jika 2x − 7 = 9, maka nilai x adalah ...', opsi: ['8', '7', '9', '6'], kunci: 'A', skor: 5, level: 'L1' },
    { kisiItemId: it2.id, tipe: 'PG', pertanyaan: 'Diketahui x + y = 12 dan x − y = 4. Dengan metode substitusi, nilai y adalah ...', opsi: ['4', '8', '6', '2'], kunci: 'A', skor: 5, level: 'L2' },
    { kisiItemId: it2.id, tipe: 'PG', pertanyaan: 'Himpunan penyelesaian dari x + y = 10 dan x − y = 2 adalah ...', opsi: ['{(6, 4)}', '{(4, 6)}', '{(5, 5)}', '{(8, 2)}'], kunci: 'A', skor: 5, level: 'L2' },
    { kisiItemId: it2.id, tipe: 'PG', pertanyaan: 'Jumlah dua bilangan adalah 15 dan selisihnya 3. Bilangan yang lebih besar adalah ...', opsi: ['9', '8', '7', '10'], kunci: 'A', skor: 5, level: 'L2' },
    { kisiItemId: it3.id, tipe: 'BS', pertanyaan: 'Pasangan (3, 1) merupakan penyelesaian dari sistem persamaan x + y = 4 dan x − y = 2.', kunci: 'BENAR', skor: 5, level: 'L1' },
    { kisiItemId: it3.id, tipe: 'BS', pertanyaan: 'Sistem persamaan x + y = 5 dan x + y = 7 tidak memiliki penyelesaian.', kunci: 'BENAR', skor: 5, level: 'L2' },
    { kisiItemId: it3.id, tipe: 'BS', pertanyaan: 'Metode eliminasi tidak dapat digunakan tanpa dikombinasikan dengan metode substitusi.', kunci: 'SALAH', skor: 5, level: 'L1' },
    { kisiItemId: it4.id, tipe: 'MENJODOKAN', pertanyaan: 'Jodohkan setiap sistem persamaan berikut dengan solusinya!', kiri: ['3x + 2y = 16 ; x = y + 2', 'x + 5y = 21 ; x = 2y', '2x + y = 12 ; x − y = 3'], kanan: ['x = 4, y = 2', 'x = 6, y = 3', 'x = 5, y = 2', 'x = 2, y = 4'], kunci: { p0: 'p0', p1: 'p1', p2: 'p2' }, skor: 10, level: 'L1' },
    { kisiItemId: it5.id, tipe: 'ESSAY', pertanyaan: 'Rina membeli 2 buku dan 3 pensil seharga Rp19.000. Dina membeli 1 buku dan 2 pensil seharga Rp11.000. Tentukan harga 1 buku dan 1 pensil, lalu tuliskan kesimpulanmu!', kunciPoin: 'Misal b = harga buku, p = harga pensil. Model: 2b + 3p = 19000 ; b + 2p = 11000. Eliminasi/substitusi → b = 5000, p = 3000. Kesimpulan: harga 1 buku Rp5.000 dan 1 pensil Rp3.000. (Skor: model benar 5, proses 6, kesimpulan 4)', skor: 15, level: 'L3' },
    { kisiItemId: it5.id, tipe: 'ESSAY', pertanyaan: 'Harga 3 kg jeruk dan 2 kg apel adalah Rp97.000, sedangkan harga 1 kg jeruk dan 3 kg apel adalah Rp79.000. Tentukan harga 1 kg jeruk dan 1 kg apel!', kunciPoin: 'Model: 3j + 2a = 97000 ; j + 3a = 79000. Substitusi: j = 79000 − 3a → 237000 − 9a + 2a = 97000 → a = 20000, j = 19000. (Model 5, proses 6, hasil 4)', skor: 15, level: 'L3' },
    { kisiItemId: it6.id, tipe: 'ESSAY', pertanyaan: 'Budi membeli 2 kg mangga dan 1 kg jeruk seharga Rp65.000. Sedangkan 1 kg mangga dan 2 kg jeruk seharga Rp70.000. Susun model SPLDV-nya, selesaikan, dan tuliskan kesimpulan!', kunciPoin: 'Model: 2m + j = 65000 ; m + 2j = 70000 → m = 20000, j = 25000. (Model 8, proses 10, kesimpulan 7)', skor: 25, level: 'L2' },
  ];
  const soalList = [];
  for (const s of soalSeed) {
    const doc = { id: id('so'), guruId: guru.id, kisiId: kisi.id, ...s, createdAt: iso(-10 * 864e5) };
    await store.insert('soal', doc);
    soalList.push(doc);
  }

  // ===== Asesmen (dipublikasikan) =====
  const asesmen = {
    id: id('as'),
    guruId: guru.id,
    judul: 'Sumatif Tengah Semester — Matematika VIII (Aljabar)',
    kisiId: kisi.id,
    kelasIds: [kelasA.id, kelasB.id],
    token: 'MTK800',
    durasiMenit: 60,
    buka: iso(-3 * 864e5),
    tutup: iso(7 * 864e5),
    acakSoal: true,
    acakOpsi: false,
    tampilkanHasil: true,
    anonimLeaderboard: false,
    kktp: 75,
    refleksiQs: [
      'Bagian mana yang paling sulit untukmu? Mengapa?',
      'Bagaimana perasaanmu setelah mengerjakan asesmen ini?',
      'Apa yang akan kamu lakukan agar lebih memahami materi ini?',
    ],
    soalIds: soalList.map((s) => s.id),
    status: 'publik',
    createdAt: iso(-7 * 864e5),
  };
  await store.insert('asesmen', asesmen);

  // ===== Attempt demo (agar rekap & leaderboard langsung terlihat) =====
  const peserta = [
    { s: siswaA[0], p: 0.95, graded: true }, { s: siswaA[1], p: 0.85, graded: true },
    { s: siswaA[2], p: 0.8, graded: true }, { s: siswaA[3], p: 0.7, graded: true },
    { s: siswaA[4], p: 0.65, graded: true }, { s: siswaA[5], p: 0.55, graded: true },
    { s: siswaA[7], p: 0.45, graded: true }, { s: siswaB[0], p: 0.9, graded: true },
    { s: siswaB[1], p: 0.75, graded: true }, { s: siswaB[2], p: 0.6, graded: true },
    { s: siswaB[3], p: 0.4, graded: false }, { s: siswaA[9], p: 0.5, graded: false },
  ];

  const jawabanEssayContoh = [
    '2b + 3p = 19000 dan b + 2p = 11000. Aku eliminasi: dikali 2 → 2b + 4p = 22000. Kurang: p = 3000, b = 5000. Jadi buku Rp5.000, pensil Rp3.000.',
    '3j + 2a = 97000, j + 3a = 79000. j = 79000 - 3a. Masukkan: 237000 - 7a = 97000, a = 20000, j = 19000. Jeruk Rp19.000, apel Rp20.000.',
    'Modelnya 2m + j = 65000 dan m + 2j = 70000. Hasilnya mangga Rp20.000 dan jeruk Rp25.000. Aku bingung di langkah eliminasi tapi sudah paham.',
  ];

  let j = 0;
  for (const { s, p, graded } of peserta) {
    const perSoal = {};
    let dO = 0, mO = 0, dE = 0, mE = 0;
    const jawaban = {};
    soalList.forEach((so, idx) => {
      const pl = Math.min(1, Math.max(0, p + (Math.sin(idx * 7 + s.nama.length) * 0.12)));
      if (so.tipe === 'ESSAY') {
        const dapat = graded ? r2(so.skor * pl) : 0;
        perSoal[so.id] = { dapat, max: so.skor, manual: true };
        dE += dapat; mE += so.skor;
        if (!graded || idx === 9) {
          jawaban[so.id] = jawabanEssayContoh[j % jawabanEssayContoh.length];
        } else {
          jawaban[so.id] = jawabanEssayContoh[(idx + j) % jawabanEssayContoh.length];
        }
      } else {
        const benar = Math.random() < pl;
        const dapat = benar ? so.skor : (so.tipe === 'MENJODOKAN' ? r2(so.skor * Math.max(0, pl - 0.3)) : 0);
        perSoal[so.id] = { dapat, max: so.skor };
        dO += dapat; mO += so.skor;
        // Simpan pilihan mentah agar analisis pengecoh terlihat di demo
        if (so.tipe === 'PG') {
          const hurufOpsi = so.opsi.map((_, i) => String.fromCharCode(65 + i)).filter((h) => h !== so.kunci);
          jawaban[so.id] = benar || !hurufOpsi.length ? so.kunci : hurufOpsi[Math.floor(Math.random() * hurufOpsi.length)];
        } else if (so.tipe === 'BS') {
          jawaban[so.id] = benar ? so.kunci : so.kunci === 'BENAR' ? 'SALAH' : 'BENAR';
        } else if (so.tipe === 'MENJODOKAN') {
          const kj = {};
          Object.keys(so.kunci || {}).forEach((k, i) => {
            kj[k] = benar || i > 0 ? so.kunci[k] : Object.values(so.kunci)[Object.values(so.kunci).length - 1 - i];
          });
          jawaban[so.id] = kj;
        }
      }
    });
    j++;
    const attempt = {
      id: id('at'),
      asesmenId: asesmen.id,
      siswaId: s.id,
      kelasId: s.kelasId,
      mulai: iso(-(1 + j) * 864e5),
      selesai: iso(-(1 + j) * 864e5 + 45 * 6e4),
      status: graded ? 'dinilai' : 'selesai',
      soalOrder: soalList.map((so) => so.id),
      jawaban,
      perSoal,
      render: {},
      skorObjektif: mO ? r2((dO / mO) * 100) : null,
      skorEssay: mE ? r2((dE / mE) * 100) : null,
      skorAkhir: r2(((dO + dE) / (mO + mE)) * 100),
    };
    await store.insert('attempt', attempt);

    if (graded && j <= 8) {
      await store.insert('refleksi', {
        id: id('rf'),
        asesmenId: asesmen.id,
        siswaId: s.id,
        attemptId: attempt.id,
        jawaban: {
          q0: ['Soal essay nomor 2, aku bingung menentukan model matematisnya.', 'Menjodohkan, karena opsi pengecohnya mirip.', 'SPLDV bagian eliminasi, kadang hasilnya minus.', 'Soal cerita belanja, sulit mengubah kalimat jadi persamaan.'][j % 4],
          q1: ['Senang, soalnya sesuai yang dipelajari.', 'Agak deg-degan tapi selesai juga.', 'Biasa saja, tapi capek menghitung.', 'Senang karena hampir semua soal bisa.'][j % 4],
          q2: ['Latihan soal SPLDV lagi 5 soal per hari.', 'Minta penjelasan ulang tentang eliminasi.', 'Belajar bareng teman saat istirahat.', 'Tonton video pembelajaran di rumah.'][j % 4],
        },
        createdAt: iso(-(1 + j) * 864e5 + 50 * 6e4),
      });
    }
  }

  return { guru, kelasA, kelasB, kisi, asesmen };
}
