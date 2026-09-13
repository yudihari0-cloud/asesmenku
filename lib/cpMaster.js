const SUMBER = 'BSKAP 046/H/KR/2025 & 032/H/KR/2025 (ringkasan)';

/** Helper: buat grup CP satu mapel per fase */
const grup = (fase, mapel, singk, items) =>
  items.map(([elemen, teks], i) => ({ fase, mapel, elemen, kode: singk + '.' + fase + '.' + (i + 1), teks, sumber: SUMBER }));

export const CP_MASTER = [
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

