import { id, token } from './ids';
import { hashPw } from './auth';

/**
 * Data demo awal — dibuat otomatis saat database masih kosong.
 * CP di bawah adalah RINGKASAN dari BSKAP 046/H/KR/2025 untuk contoh;
 * lengkapnya dapat diimpor dari dokumen resmi ke tab "cp".
 */

const SUMBER = 'BSKAP 046/H/KR/2025 & 032/H/KR/2025 (ringkasan)';

/** Helper: buat grup CP satu mapel per fase */
const grup = (fase, mapel, singk, items) =>
  items.map(([elemen, teks], i) => ({ fase, mapel, elemen, kode: singk + '.' + fase + '.' + (i + 1), teks, sumber: SUMBER }));

const CP_SEED = [
  // ============ FASE A (SD kelas 1-2) ============
  ...grup('A', 'Pendidikan Agama Islam & Budi Pekerti', 'PAI', [
    ['Al-Quran & Hadis', 'Membaca dan menghafal surat-surat pendek serta memahami makna dasarnya dalam kehidupan sehari-hari.'],
    ['Iman & Akhlak', 'Mengenal Allah melalui ciptaan-Nya, memahami dasar rukun iman, dan membiasakan akhlak terpuji.'],
    ['Fikih', 'Mempraktikkan ibadah dasar: bersuci (thaharah), shalat, serta mengenal perilaku terpuji dan tercela.'],
    ['Sejarah Peradaban Islam', 'Mengenal kisah nabi dan tokoh Islam yang menginspirasi pembentukan karakter.'],
  ]),
  ...grup('A', 'Pendidikan Pancasila', 'PP', [
    ['Pancasila', 'Mengenal simbol dan nilai dasar setiap sila Pancasila serta menerapkannya di keluarga dan sekolah.'],
    ['UUD NKI', 'Mengenal aturan di rumah dan sekolah sebagai gambaran awal norma dan aturan bersama.'],
    ['Bhinneka Tunggal Ika', 'Mengenal keragaman suku, budaya, dan agama di lingkungan sekitar serta menghargai perbedaan.'],
    ['NKRI', 'Mengenal identitas dan lambang negara Indonesia: bendera, bahasa, lagu kebangsaan, dan Pancasila.'],
  ]),
  ...grup('A', 'Bahasa Indonesia', 'BI', [
    ['Menyimak', 'Memahami informasi dari teks lisan sederhana: cerita, instruksi, pengumuman, dan lagu anak.'],
    ['Membaca & Memirsa', 'Membaca kata dan kalimat sederhana, memahami teks bergambar, dan merespons isinya.'],
    ['Berbicara & Mempresentasikan', 'Menyampaikan gagasan, perasaan, dan pengalaman secara runtut dan santun dalam percakapan.'],
    ['Menulis', 'Menulis kata dan kalimat sederhana dengan ejaan yang tepat serta melengkapi teks rumpang.'],
  ]),
  ...grup('A', 'Matematika', 'MTK', [
    ['Bilangan', 'Memahami bilangan cacah hingga 1.000, pecahan sederhana, serta penjumlahan dan pengurangan dalam konteks sehari-hari.'],
    ['Aljabar', 'Mengenal pola bilangan dan pola gambar serta menentukan kelanjutan suatu pola sederhana.'],
    ['Pengukuran', 'Mengukur panjang, berat, dan waktu menggunakan satuan baku dan non-baku dalam kegiatan sehari-hari.'],
    ['Geometri', 'Mengenal bentuk bangun datar dan bangun ruang serta unsur-unsurnya di lingkungan sekitar.'],
    ['Analisis Data & Peluang', 'Mengumpulkan, menyajikan, dan membaca data sederhana dalam bentuk gambar dan tabel.'],
  ]),
  ...grup('A', 'Seni Musik', 'SNM', [
    ['Menyimak & Merespons', 'Merespons bunyi dan musik dari lingkungan serta hasil karya musik dengan gerak dan ekspresi.'],
    ['Menyanyi & Bermusik', 'Menyanyikan lagu anak Indonesia dengan intonasi dan irama yang tepat disertai permainan ritmis sederhana.'],
  ]),
  ...grup('A', 'PJOK', 'PJOK', [
    ['Keterampilan Gerak', 'Mempraktikkan variasi gerak dasar lokomotor, non-lokomotor, dan manipulatif dalam bentuk permainan.'],
    ['Pengetahuan Gerak', 'Memahami konsep gerak dasar dan kesadaran tubuh: bagian tubuh, bentuk, arah, dan level.'],
    ['Pemanfaatan & Kebugaran', 'Mempraktikkan aktivitas fisik yang bermanfaat untuk mempertahankan kebugaran tubuh.'],
    ['Hidup Sehat', 'Membiasakan pola hidup bersih dan sehat serta perilaku peduli lingkungan.'],
  ]),

  // ============ FASE B (SD kelas 3-4) ============
  ...grup('B', 'Pendidikan Agama Islam & Budi Pekerti', 'PAI', [
    ['Al-Quran & Hadis', 'Membaca, menghafal, dan memahami kandungan surat pendek serta menerapkan nilai-nilainya.'],
    ['Iman & Akhlak', 'Memahami rukun iman dan Asmaul Husna serta membiasakan akhlak mulia dalam interaksi sosial.'],
    ['Fikih', 'Mempraktikkan thaharah dan shalat fardhu dengan tertib serta mengenal puasa dan zakat.'],
    ['Sejarah Peradaban Islam', 'Mengenal sejarah nabi dan perkembangan Islam yang menumbuhkan kebanggaan beragama.'],
  ]),
  ...grup('B', 'Pendidikan Pancasila', 'PP', [
    ['Pancasila', 'Memahami nilai-nilai Pancasila dan menghubungkannya dengan hak dan kewajiban dalam kehidupan berbangsa.'],
    ['UUD NKI', 'Memahami fungsi aturan dan norma di lingkungan keluarga, sekolah, dan masyarakat.'],
    ['Bhinneka Tunggal Ika', 'Menghargai keberagaman budaya, agama, dan suku serta menjaga kerukunan di lingkungannya.'],
    ['NKRI', 'Memahami wilayah Indonesia, wawasan kebangsaan, serta simbol-simbol kebangsaan.'],
  ]),
  ...grup('B', 'Bahasa Indonesia', 'BI', [
    ['Menyimak', 'Memahami informasi dan ide dari teks lisan (berita, cerita, instruksi) dan menyampaikan kembali isinya.'],
    ['Membaca & Memirsa', 'Memahami teks faktual dan fiksi serta membedakan gagasan utama dari informasi rinci.'],
    ['Berbicara & Mempresentasikan', 'Berbicara runtut dalam percakapan, menceritakan pengalaman, dan mempresentasikan informasi sederhana.'],
    ['Menulis', 'Menulis paragraf sederhana (deskripsi dan narasi) dengan struktur kalimat dan ejaan yang tepat.'],
  ]),
  ...grup('B', 'Matematika', 'MTK', [
    ['Bilangan', 'Memahami bilangan cacah sampai puluhan ribu, pecahan, desimal, serta operasi hitung dalam penyelesaian masalah.'],
    ['Aljabar', 'Mengenal pola bilangan dan hubungan sama-tidak sama serta menyajikan bentuk aljabar sederhana.'],
    ['Pengukuran', 'Mengukur dan mengonversi satuan panjang, berat, dan waktu serta menghitung luas dan keliling bangun datar.'],
    ['Geometri', 'Mengenal sifat bangun datar dan bangun ruang, kekongruenan sederhana, serta garis dan sudut.'],
    ['Analisis Data & Peluang', 'Mengumpulkan, menyajikan (tabel dan diagram batang), menafsirkan data, serta mengenal peluang sederhana.'],
  ]),
  ...grup('B', 'IPA', 'IPA', [
    ['Pemahaman IPA', 'Memahami ciri makhluk hidup, organ tubuh, gaya, energi, dan objek langit dalam kehidupan sehari-hari.'],
    ['Keterampilan Proses', 'Melakukan penyelidikan sederhana: mengamati, mengajukan pertanyaan, memprediksi, dan menyajikan hasil.'],
  ]),
  ...grup('B', 'IPS', 'IPS', [
    ['IPS (Terintegrasi)', 'Memahami diri dan lingkungan (keluarga, sekolah, masyarakat), kebutuhan manusia, serta keberagaman sosial-budaya Indonesia.'],
  ]),
  ...grup('B', 'Bahasa Inggris', 'ENG', [
    ['Menyimak & Berbicara', 'Memahami instruksi dan teks lisan sederhana serta berinteraksi dengan ungkapan sehari-hari.'],
    ['Membaca & Menulis', 'Membaca dan menulis teks pendek sederhana dengan kosakata dasar.'],
  ]),
  ...grup('B', 'Seni Musik', 'SNM', [
    ['Menyimak & Merespons', 'Menganalisis unsur musik pada hasil karya dan pertunjukan musik serta meresponsnya.'],
    ['Menyanyi & Bermusik', 'Menyanyikan lagu daerah dan nasional dengan teknik vokal dasar serta memainkan instrumen ritmis.'],
  ]),
  ...grup('B', 'PJOK', 'PJOK', [
    ['Keterampilan Gerak', 'Mempraktikkan variasi dan kombinasi gerak dasar dalam permainan, olahraga, seni, dan aktivitas gerak.'],
    ['Pengetahuan Gerak', 'Memahami konsep gerak spesifik berbagai aktivitas gerak dan cara mengukurnya.'],
    ['Pemanfaatan & Kebugaran', 'Menganalisis manfaat dan mempraktikkan aktivitas kebugaran jasmani secara teratur.'],
    ['Hidup Sehat', 'Menganalisis perilaku hidup sehat dan menerapkannya dalam kehidupan sehari-hari.'],
  ]),

  // ============ FASE C (SD kelas 5-6) ============
  ...grup('C', 'Pendidikan Agama Islam & Budi Pekerti', 'PAI', [
    ['Al-Quran & Hadis', 'Membaca, menghafal, dan menelaah kandungan surat serta hadis pilihan dan memaknainya.'],
    ['Iman & Akhlak', 'Memahami materi iman, sirah nabi, dan akhlak terpuji dalam bermasyarakat digital maupun nyata.'],
    ['Fikih', 'Memahami hukum dan praktik ibadah (shalat, puasa, zakat, haji) serta kehalalan makanan dan produk.'],
    ['Sejarah Peradaban Islam', 'Menganalisis kisah perjuangan penyebaran Islam di Indonesia dan nilai belajarnya.'],
  ]),
  ...grup('C', 'Pendidikan Pancasila', 'PP', [
    ['Pancasila', 'Menganalisis nilai-nilai Pancasila sebagai pandangan hidup dan menerapkannya dalam kehidupan bermasyarakat.'],
    ['UUD NKI', 'Memahami norma, aturan, dan sistem pemerintahan serta perilaku taat aturan di masyarakat.'],
    ['Bhinneka Tunggal Ika', 'Menghargai dan memelihara keberagaman budaya, agama, suku, serta menjaga persatuan.'],
    ['NKRI', 'Memahami wilayah NKRI, arti penting pertahanan dan keamanan, serta wawasan kebangsaan.'],
  ]),
  ...grup('C', 'Bahasa Indonesia', 'BI', [
    ['Menyimak', 'Memahami dan mengevaluasi ide serta informasi dari teks lisan seperti berita, pidato, dan diskusi.'],
    ['Membaca & Memirsa', 'Memahami, merespons, dan mengevaluasi teks faktual, fiksi, dan media digital secara kritis.'],
    ['Berbicara & Mempresentasikan', 'Menyampaikan gagasan dalam diskusi, presentasi, dan debat sederhana secara efektif dan santun.'],
    ['Menulis', 'Menghasilkan berbagai teks (narasi, deskripsi, eksposisi) dengan struktur, kosakata, dan ejaan yang tepat.'],
  ]),
  ...grup('C', 'Matematika', 'MTK', [
    ['Bilangan', 'Memahami bilangan bulat dan pecahan beserta operasinya, perbandingan, skala, serta bilangan berpangkat dan akar.'],
    ['Aljabar', 'Menggunakan variabel, bentuk aljabar, relasi dan fungsi, serta persamaan linear satu variabel dalam pemecahan masalah.'],
    ['Pengukuran', 'Menyelesaikan masalah pengukuran (panjang, massa, waktu, debit) dan menaksir hasil ukur dalam konteks nyata.'],
    ['Geometri', 'Menganalisis sifat dan unsur bangun datar dan ruang serta menyelesaikan masalah simetri, luas, dan volume.'],
    ['Analisis Data & Peluang', 'Menganalisis data tunggal dan menghitung peluang kejadian sederhana untuk mengambil kesimpulan.'],
  ]),
  ...grup('C', 'IPA', 'IPA', [
    ['Pemahaman IPA', 'Memahami sistem organ tubuh, zat dan perubahannya, energi, gaya, serta bumi dan tata surya.'],
    ['Keterampilan Proses', 'Melakukan penyelidikan ilmiah: merumuskan masalah, hipotesis, eksperimen, mengolah data, dan menyimpulkan.'],
  ]),
  ...grup('C', 'IPS', 'IPS', [
    ['IPS (Terintegrasi)', 'Menganalisis kondisi geografis Indonesia, proses ekonomi, perjuangan bangsa, serta globalisasi dan perdagangan.'],
  ]),
  ...grup('C', 'Bahasa Inggris', 'ENG', [
    ['Menyimak & Berbicara', 'Memahami teks lisan yang lebih kompleks dan berpartisipasi dalam percakapan sehari-hari.'],
    ['Membaca & Menulis', 'Memahami teks faktual dan fiksi pendek serta menulis teks dengan struktur yang sesuai.'],
  ]),
  ...grup('C', 'Seni Musik', 'SNM', [
    ['Menyimak & Merespons', 'Menganalisis dan mengevaluasi karya musik dari berbagai genre dan budaya secara kreatif.'],
    ['Menyanyi & Bermusik', 'Mempertunjukkan lagu daerah/nasional dengan teknik vokal dan iringan musik secara ensembel.'],
  ]),
  ...grup('C', 'PJOK', 'PJOK', [
    ['Keterampilan Gerak', 'Mempraktikkan hasil evaluasi dan pengembangan gerak spesifik dalam permainan dan olahraga.'],
    ['Pengetahuan Gerak', 'Menganalisis konsep gerak spesifik dan proses evaluasi aktivitas gerak.'],
    ['Pemanfaatan & Kebugaran', 'Merancang dan mempraktikkan program kebugaran jasmani sesuai kebutuhan tubuh.'],
    ['Hidup Sehat', 'Menganalisis pola hidup sehat, gizi seimbang, dan pencegahan penyakit pada diri dan keluarga.'],
  ]),

  // ============ FASE D (SMP kelas 7-9) ============
  ...grup('D', 'Pendidikan Agama Islam & Budi Pekerti', 'PAI', [
    ['Al-Quran & Hadis', 'Membaca, menghafal, dan menelaah kandungan Al-Quran serta hadis pilihan, lalu memaknainya sebagai pedoman hidup.'],
    ['Iman & Akhlak', 'Memahami materi iman, akhlak terpuji, dan keteladanan nabi dalam kehidupan bermasyarakat dan digital.'],
    ['Fikih', 'Memahami dan mempraktikkan ibadah (shalat, zakat, puasa) serta hukum Islam tentang muamalah sehari-hari.'],
    ['Sejarah Peradaban Islam', 'Menganalisis dakwah dan pemikiran tokoh Islam serta integrasi Islam dengan budaya lokal Indonesia.'],
  ]),
  ...grup('D', 'Pendidikan Pancasila', 'PP', [
    ['Pancasila', 'Menganalisis dan menginternalisasi nilai-nilai Pancasila sebagai dasar berpikir, bersikap, dan bertindak.'],
    ['UUD NKI', 'Memahami sistem pemerintahan, norma hukum, serta perilaku taat hukum dan sadar konstitusi.'],
    ['Bhinneka Tunggal Ika', 'Menghargai dan memelihara keberagaman budaya serta sikap inklusif dalam masyarakat majemuk.'],
    ['NKRI', 'Memahami konsep pertahanan dan keamanan negara serta mengkhawatirkan/menjaga integritas NKRI.'],
  ]),
  ...grup('D', 'Bahasa Indonesia', 'BI', [
    ['Menyimak', 'Memahami ide pokok, ide penjelas, dan fakta penting dari teks nonfiksi maupun fiksi yang didengar/diputar.'],
    ['Membaca & Memirsa', 'Memahami dan mengevaluasi gagasan tersurat-tersirat, fakta dan opini pada teks informasi dan literasi transaksional.'],
    ['Berbicara & Mempresentasikan', 'Menghasilkan teks narasi, eksposisi, dan pidato dengan struktur dan kaidah kebahasaan yang tepat secara lisan.'],
    ['Menulis', 'Menghasilkan teks narasi, eksposisi, dan jawaban atas pertanyaan dengan struktur dan kaidah kebahasaan yang tepat.'],
  ]),
  ...grup('D', 'Bahasa Inggris', 'ENG', [
    ['Menyimak & Berbicara', 'Memahami teks lisan monolog dan dialog interaktif serta menggunakan bahasa Inggris untuk komunikasi interpersonal.'],
    ['Membaca & Memirsa', 'Memahami, merespons, dan memroduksi teks monolog/esei berbentuk narasi, deskripsi, dan prosedur.'],
    ['Menulis & Mempresentasikan', 'Menulis dan mempresentasikan teks tertulis dengan pengembangan paragraf dan kosakata yang tepat.'],
  ]),
  ...grup('D', 'Matematika', 'MTK', [
    ['Bilangan', 'Membaca, menulis, dan membandingkan bilangan bulat, rasional, irasional, bilangan berpangkat, akar, dan notasi ilmiah.'],
    ['Aljabar', 'Menggunakan faktorisasi, ekspansi, dan operasi bentuk aljabar serta persamaan/pertidaksamaan linear untuk memecahkan masalah.'],
    ['Pengukuran', 'Menggunakan perbandingan dan skala faktor untuk menyelesaikan masalah kongruensi, kesebangunan, dan trigonometri dasar.'],
    ['Geometri', 'Mengklasifikasi bangun datar dan ruang berdasarkan sisi dan sudut serta menggunakan teorema Pythagoras.'],
    ['Analisis Data & Peluang', 'Memperoleh, mengolah, mempresentasikan, menafsirkan, dan menganalisis data tunggal untuk memecahkan masalah.'],
  ]),
  ...grup('D', 'IPA', 'IPA', [
    ['Pemahaman IPA', 'Memahami sistem organ tubuh, zat dan perubahannya, energi dan perubahannya, serta makhluk hidup dan lingkungannya.'],
    ['Keterampilan Proses', 'Menerapkan keterampilan proses sains untuk menyelidiki masalah sehari-hari: observasi, eksperimen, dan komunikasi data.'],
  ]),
  ...grup('D', 'IPS', 'IPS', [
    ['IPS (Terintegrasi)', 'Menganalisis interaksi sosial, kebutuhan ekonomi, kondisi geografis, perjalanan sejarah bangsa, dan pemerintahan Indonesia.'],
  ]),
  ...grup('D', 'Bahasa Inggris', 'ENG2', [
    ['Menyimak & Berbicara', 'Memahami percakapan transaksional dan interpersonal serta menyampaikan informasi lisan secara runtut.'],
  ]),
  ...grup('D', 'PJOK', 'PJOK', [
    ['Keterampilan Gerak', 'Mempraktikkan hasil evaluasi dan pengembangan gerak spesifik aktivitas permainan, olahraga, dan seni gerak.'],
    ['Pengetahuan Gerak', 'Menganalisis konsep gerak spesifik aktivitas gerak dan proses evaluasinya.'],
    ['Pemanfaatan & Kebugaran', 'Menganalisis dan mempraktikkan aktivitas kebugaran jasmani yang memadai dan berkesinambungan.'],
    ['Hidup Sehat', 'Menganalisis penerapan perilaku hidup sehat dan membiasakan gaya hidup aktif serta produktif.'],
  ]),
  ...grup('D', 'Informatika', 'INF', [
    ['Berpikir Komputasional', 'Menerapkan dekomposisi, pengenalan pola, abstraksi, dan algoritma untuk memecahkan masalah dan membuat artefak digital.'],
    ['Teknologi Informasi & Komunikasi', 'Menggunakan perangkat lunak perkantoran, membuat konten digital, serta memahami sistem komputer dan algoritma dasar.'],
    ['Jaringan Komputer & Internet', 'Memahami cara kerja jaringan komputer, internet, dan komunikasi data serta menjaga keamanan dan privasi digital.'],
    ['Analisis Data', 'Mengumpulkan, mengolah, memvisualisasikan, dan menafsirkan data untuk pengambilan keputusan yang berbasis data.'],
    ['Praktik Lintas Bidang', 'Mengintegrasikan kompetensi informatika untuk merancang proyek digital yang bermanfaat bagi masyarakat.'],
  ]),
  ...grup('D', 'Seni Musik', 'SNM', [
    ['Menyimak & Merespons', 'Menganalisis dan mengevaluasi karya dan pertunjukan musik lokal, nasional, dan global secara kreatif.'],
    ['Mempertunjukkan', 'Menampilkan hasil karya musik dengan memilih teknik, media, dan instrumen sesuai konteks pertunjukan.'],
  ]),
  ...grup('D', 'Seni Rupa', 'SNR', [
    ['Menggambar & Berkarya', 'Mengamati, mengolah, dan mengekspresikan ide dalam karya seni rupa dua dimensi dan tiga dimensi.'],
    ['Mengapresiasi', 'Menganalisis karya seni rupa dari aspek unsur, prinsip, dan konteks budaya untuk mengambil gagasan kreatif.'],
  ]),

  // ============ FASE E (SMA kelas 10) ============
  ...grup('E', 'Pendidikan Agama Islam & Budi Pekerti', 'PAI', [
    ['Al-Quran & Hadis', 'Menganalisis kandungan Al-Quran dan hadis tentang akidah, syariat, dan ihsan sebagai pandangan hidup.'],
    ['Iman & Akhlak', 'Menganalisis konsep iman, akhlak mulia, dan keteladanan rasul untuk menumbuhkan karakter dalam kehidupan modern.'],
    ['Fikih', 'Menganalisis hukum Islam tentang ibadah, muamalah, dan kehidupan sosial-kontemporer.'],
    ['Sejarah Peradaban Islam', 'Menganalisis dinamika pemikiran, dakwah, dan peradaban Islam serta relevansinya bagi kemaslahatan umat.'],
  ]),
  ...grup('E', 'Pendidikan Pancasila', 'PP', [
    ['Pancasila', 'Menganalisis dan menginternalisasi Pancasila sebagai sistem etika dan dasar negara dalam kehidupan berbangsa.'],
    ['UUD NKI', 'Menganalisis konstitusi, sistem hukum dan pemerintahan, serta sikap sadar dan taat konstitusi.'],
    ['Bhinneka Tunggal Ika', 'Menganalisis keragaman budaya dan sikap inklusif untuk memperkuat kebudayaan nasional.'],
    ['NKRI', 'Menganalisis konsep dan dinamika pertahanan-keamanan negara serta upaya menjaga integritas NKRI.'],
  ]),
  ...grup('E', 'Bahasa Indonesia', 'BI', [
    ['Menyimak', 'Memahami, merespons, dan mengevaluasi makna, fungsi, dan struktur teks nonliterasi dan literasi yang didengar.'],
    ['Membaca & Memirsa', 'Memahami, merespons, dan mengevaluasi makna, fungsi, dan struktur teks nonliterasi dan literasi yang dibaca/dipirsa.'],
    ['Berbicara & Mempresentasikan', 'Merencanakan, menyampaikan, dan mengevaluasi gagasan dalam teks nonliterasi dan literasi secara lisan.'],
    ['Menulis', 'Merencanakan, menuliskan, merevisi, dan menyunting teks nonliterasi dan literasi sesuai tujuan dan struktur.'],
  ]),
  ...grup('E', 'Bahasa Inggris', 'ENG', [
    ['Menyimak & Berbicara', 'Memahami gagasan pokok dan informasi rinci dari teks lisan dan menyampaikan pendapat secara efektif.'],
    ['Membaca & Menulis', 'Memahami, merespons, dan menghasilkan teks narasi, eksposisi, dan diskusi dengan struktur dan kosakata yang tepat.'],
  ]),
  ...grup('E', 'Matematika', 'MTK', [
    ['Bilangan', 'Memahami bilangan berpangkat, logaritma, barisan dan deret, serta penerapannya dalam konteks nyata.'],
    ['Aljabar', 'Memahami sistem persamaan/pertidaksamaan linear, fungsi kuadrat, serta matriks dan transformasinya secara geometris.'],
    ['Pengukuran', 'Menyelesaikan masalah pengukuran dan trigonometri (perbandingan trigonometri, aturan sinus-cosinus).'],
    ['Geometri', 'Memahami geometri dimensi tiga, jarak titik-garis-bidang, serta statistika dan peluang dalam pemecahan masalah.'],
    ['Analisis Data & Peluang', 'Menganalisis data (ukuran pemusatan dan penyebaran) serta menghitung peluang kejadian majemuk.'],
  ]),
  ...grup('E', 'IPA', 'IPA', [
    ['Pemahaman IPA', 'Memahami konsep bioteknologi, gerak dan gaya, zat dan perubahannya, serta pemanasan global secara terintegrasi.'],
    ['Keterampilan Proses', 'Merancang dan melakukan penyelidikan ilmiah serta mengomunikasikan hasilnya berbasis bukti.'],
  ]),
  ...grup('E', 'IPS', 'IPS', [
    ['IPS (Terintegrasi)', 'Menganalisis konsep sosial, ekonomi, geografi, sejarah, dan kewarganegaraan untuk memahami masyarakat yang berubah.'],
  ]),
  ...grup('E', 'PJOK', 'PJOK', [
    ['Keterampilan & Kebugaran', 'Mempraktikkan aktivitas permainan bola besar/kecil, senam, atletik, dan olahraga air serta menjaga kebugaran.'],
    ['Hidup Sehat', 'Menganalisis faktor pencegah perilaku hidup sehat dan menerapkan aktivitas jasmaniah untuk kebugaran.'],
  ]),
  ...grup('E', 'Informatika', 'INF', [
    ['Berpikir Komputasional & Sistem Komputer', 'Menerapkan berpikir komputasional, memahami sistem komputer, jaringan, internet, dan keamanan data.'],
    ['Analisis Data & Algoritma', 'Menganalisis data dan menerapkan algoritma-pemrograman untuk memecahkan masalah dan membuat artefak digital.'],
    ['Dampak Sosial Informatika', 'Menganalisis dampak sosial teknologi informasi serta menerapkan etika digital dan regulasi kecerdasan artifisial.'],
  ]),
  ...grup('E', 'Seni Musik', 'SNM', [
    ['Kriya & Pertunjukan Musik', 'Mencipta dan mempertunjukkan karya musik dengan memanfaatkan unsur, prinsip, dan teknologi musik.'],
    ['Apresiasi Musik', 'Menganalisis karya musik lokal, nasional, dan global dari aspek sejarah, budaya, dan teknologi.'],
  ]),

  // ============ FASE F (SMA kelas 11-12, mapel pilihan) ============
  ...grup('F', 'Matematika Lanjut', 'MTL', [
    ['Kompetensi Akhir Fase', 'Menguasai matriks, transformasi geometri, limit, turunan, integral, program linear, dan analisis data lanjutan untuk pemecahan masalah.'],
  ]),
  ...grup('F', 'Fisika', 'FIS', [
    ['Kompetensi Akhir Fase', 'Menganalisis fluida, suhu-kalor, getaran-gelombang-optik, kelistrikan, dan fisika modern dalam teknologi dan kehidupan.'],
  ]),
  ...grup('F', 'Kimia', 'KIM', [
    ['Kompetensi Akhir Fase', 'Menganalisis struktur atom, ikatan kimia, stoikiometri, larutan, reaksi redoks, dan kimia karbon dalam kehidupan.'],
  ]),
  ...grup('F', 'Biologi', 'BIO', [
    ['Kompetensi Akhir Fase', 'Menganalisis sel, virus, sistem organ, pertumbuhan-perkembangan, pewarisan sifat, bioteknologi, dan ekologi.'],
  ]),
  ...grup('F', 'Geografi', 'GEO', [
    ['Kompetensi Akhir Fase', 'Menganalisis aspek fisik dan sosial keruangan bumi, bencana, sumber daya, serta pemanfaatan peta dan citra satelit.'],
  ]),
  ...grup('F', 'Sejarah', 'SEJ', [
    ['Kompetensi Akhir Fase', 'Menganalisis konsep dasar, metode berpikir sejarah, dan perkembangan peradaban manusia Indonesia dan dunia.'],
  ]),
  ...grup('F', 'Ekonomi', 'EKO', [
    ['Kompetensi Akhir Fase', 'Menganalisis masalah ekonomi, pasar, pendapatan nasional, bank, keuangan digital, dan perdagangan internasional.'],
  ]),
  ...grup('F', 'Sosiologi', 'SOS', [
    ['Kompetensi Akhir Fase', 'Menganalisis interaksi sosial, struktur sosial, perubahan sosial, konflik, dan integrasi dalam masyarakat majemuk.'],
  ]),
  ...grup('F', 'Bahasa Indonesia Lanjut', 'BIL', [
    ['Kompetensi Akhir Fase', 'Menganalisis dan menghasilkan karya ilmiah, sastra, dan jurnalistik dengan strategi penalaran yang kritis dan kreatif.'],
  ]),
  ...grup('F', 'Bahasa Inggris Lanjut', 'ENL', [
    ['Kompetensi Akhir Fase', 'Menggunakan bahasa Inggris pada tingkat B2 untuk memahami dan memroduksi teks akademik serta presentasi.'],
  ]),
  ...grup('F', 'Seni Musik Lanjut', 'SNL', [
    ['Kompetensi Akhir Fase', 'Mencipta, memproduksi, dan mempertunjukkan karya musik dengan manajemen pertunjukan dan teknologi musik.'],
  ]),
  ...grup('F', 'Informatika Lanjut', 'INL', [
    ['Kompetensi Akhir Fase', 'Menguasai pemrograman, basis data, kecerdasan artifisial, dan pengembangan solusi digital untuk masalah nyata.'],
  ]),
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
  await store.insert('sekolah', { id: 'demo', nama: 'SMP Tunas Bangsa', alamat: 'Jl. Pendidikan No. 17, Surabaya', logo: '', masaAktifSampai: new Date(now + 10 * 365 * 864e5).toISOString(), createdAt: iso() });

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
    admin: true,
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
  const cpAljabar = (await store.list('cp')).find((c) => c.fase === 'D' && c.mapel === 'Matematika' && c.elemen === 'Aljabar');
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
