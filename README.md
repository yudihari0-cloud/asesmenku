# 🎓 AsesmenKu — Platform Asesmen Kurikulum Merdeka (CP 046)

Web app asesmen untuk guru yang **terukur sampai ke Capaian Pembelajaran** — mengacu
**Keputusan Kepala BSKAP No. 046/H/KR/2025** (revisi terbaru CP Kurikulum Merdeka,
mencabut 032/H/KR/2024).

## ✨ Fitur

| Modul | Keterangan |
|---|---|
| 🔐 **Login multi-role** | Guru & Siswa. Akun siswa dibuat otomatis dari import Excel (NISN = username, password awal `123456`) |
| 👥 **Kelas & Siswa** | Unduh template Excel → isi → unggah → kelas & akun siswa terbentuk otomatis (kelas baru pun dibuat otomatis) |
| 📋 **Kisi-kisi maker** | Pilih elemen & CP dari master CP 046 → tabel indikator (materi, level kognitif L1–L3, bentuk soal, jumlah, bobot) → export kisi-kisi ke Excel |
| 🗃️ **Bank soal** | 4 bentuk: **Pilihan Ganda, Benar/Salah, Menjodohkan, Essay** — semua tertaut ke indikator kisi-kisi; essay punya rubrik |
| 🖼️ **Soal bergambar** | Gambar di semua tipe soal — tempel URL atau unggah file (otomatis dikompres ±480px jadi data kecil) |
| 📥 **Import Master CP** | Template CP Fase A–F (SD kelas 1 s.d. SMA kelas 12) — isi dari teks resmi BSKAP 046/H/KR/2025 lalu unggah; CP langsung muncul di kisi-kisi |
| 🚀 **Asesmen online** | Susun paket soal **otomatis dari kisi-kisi**, token, jadwal buka/tutup, durasi, acak soal, share **link + token** ke siswa |
| ⏱ **Ujian siswa** | Timer, autosave jawaban, navigasi soal, auto-submit saat waktu habis, lanjut mengerjakan bila browser tertutup |
| ✅ **Penilaian hybrid** | PG/BS/menjodohkan **otomatis** (menjodohkan partial credit); essay masuk antrean koreksi guru berbasis rubrik → skor akhir dihitung ulang otomatis |
| 📊 **Rekap otomatis** | Nilai per siswa, status tuntas vs **KKTP**, rata-rata/tertinggi/terendah, **analisis penguasaan kelas per indikator** (tuntas/penguatan/remedial), export Excel |
| 🔬 **Analisis butir** | Tingkat kesukaran (P), daya beda (D, kelompok atas vs bawah 27%), sebaran **pengecoh** per butir — dasar objektif revisi soal; ikut ter-export ke Excel |
| 🖨️ **QR & Kartu Ujian** | QR code link asesmen + **kartu ujian siap cetak** per siswa (QR, link, token, NISN & password) |
| 📱 **Share WhatsApp** | Pengumuman ujian siap kirim via wa.me (grup kelas) + tombol kirim per siswa dari kartu ujian (nomor WA via kolom Excel) |
| 🔗 **Share hasil by link** | Link **publik tanpa login** untuk hasil asesmen (rekap, leaderboard, analisis butir) — hormati mode anonim; siap **cetak/PDF** |
| 🖨️ **Cetak** | Kartu ujian, rekap nilai, dan rapor mini punya tombol cetak dengan CSS print khusus |
| 📊 **Rapor Mini per Siswa** | Nilai lintas asesmen, **grafik tren SVG**, status tuntas vs KKTP, penguasaan indikator agregat (terlemah dulu), export Excel |
| 📤 **Import bank soal** | Import massal 4 tipe soal via template Excel; otomatis tertaut ke indikator kisi-kisi |
| 🏫 **Multi-sekolah** | Registrasi sekolah mandiri di `/daftar`; data kelas/siswa/soal/asesmen **terisolasi per sekolah** (langkah awal SaaS) |
| 🏆 **Leaderboard** | Peringkat dengan medali, opsi **mode anonim** |
| 🪞 **Refleksi** | Pertanyaan refleksi kustom pasca-ujian, agregat tampil ke guru |

## 🚀 Menjalankan

```bash
npm install
npm run dev        # development, buka http://localhost:3000
# atau
npm run build && npm start   # produksi
```

**Akun demo (ter-seed otomatis saat database kosong):**

- Guru: `yudi` / `guru123`
- Siswa: `61234501` / `123456` (dan 23 siswa lain, password sama)
- Contoh asesmen publik: token `MTK800` — buka `/uji/MTK800`

Data demo: 2 kelas (VIII-A, VIII-B) @12 siswa, kisi-kisi Matematika Fase D (Aljabar/SPLDV),
13 soal (5 PG, 3 BS, 1 menjodohkan, 3 essay... total sesuai bobot 100), 12 attempt + refleksi.

## 🗄️ Database: Google Sheets

Aplikasi punya **lapisan penyimpanan (store adapter)**:

1. **File JSON lokal** (`data/db.json`) — default, untuk development/demo. Nol konfigurasi.
2. **Google Sheets** — aktif dengan env berikut (lihat `.env.example`):

```env
GOOGLE_SHEETS_ID=...           # ID spreadsheet
GOOGLE_SERVICE_ACCOUNT_JSON=... # JSON service account (raw atau base64)
SESSION_SECRET=...              # string acak untuk cookie session
PUBLIC_BASE_URL=...             # opsional: domain publik untuk link asesmen
```

### Setup Google Sheets (±10 menit)

1. Buka [Google Cloud Console](https://console.cloud.google.com) → buat project.
2. **APIs & Services → Library** → aktifkan **Google Sheets API**.
3. **IAM & Admin → Service Accounts → Create** → buat key **JSON** → unduh.
4. Buat spreadsheet baru di Google Drive → salin ID dari URL.
5. **Share** spreadsheet ke email service account (peran **Editor**).
6. Isi `GOOGLE_SHEETS_ID` + `GOOGLE_SERVICE_ACCOUNT_JSON` (paste JSON utuh satu baris, atau base64-kan).
7. Saat pertama jalan, app otomatis membuat tab per koleksi: `users, kelas, cp, kisi, soal, asesmen, attempt, refleksi` — lengkap dengan header kolom sehingga tetap bisa dilihat/diedit manual seperti Excel.

> **Catatan desain:** nilai non-teks (array/objek/angka/boolean) disimpan ter-encode JSON
> agar lossless. Kuota Sheets API memadai untuk skala 1 sekolah; untuk skala SaaS besar
> disarankan pindah ke Postgres/Supabase — cukup tambahkan adapter baru di `lib/store/`.

## 🧱 Struktur

```
lib/
  store/       adapter penyimpanan (jsonStore | sheetsStore)
  seed.js      data demo (CP 046 ringkasan, kelas, siswa, kisi, soal, attempt)
  grade.js     mesin penilaian otomatis 4 tipe soal + skor akhir
  asesmen.js   komposisi soal dari kisi-kisi, rekap & analisis indikator
  analisis.js  analisis butir: P (kesukaran), D (daya beda), pengecoh
  excel.js     template import siswa/soal/CP, export kisi-kisi, rekap, rapor (SheetJS)
  auth.js      session cookie HMAC + hash password
app/
  api/         REST endpoint (auth, kelas, siswa, cp, kisi, soal, asesmen, uji, rapor, status, daftar, qr, bagikan)
  guru/        dashboard, kelas, kisi-kisi maker, bank soal, asesmen & hasil, rapor siswa, kartu ujian
  siswa/       daftar asesmen siswa
  uji/[token]  halaman ujian publik via link/token
  bagikan/     halaman publik hasil asesmen (share by link, siap cetak/PDF)
  daftar/      registrasi sekolah baru (multi-tenant)
```

## 🚢 Deploy Produksi

Dua jalur didukung penuh (pilih salah satu):

| Jalur | Panduan | Cocok untuk |
|---|---|---|
| **Cloudflare Workers** (gratis, boleh komersial ✅) | **[DEPLOY-CLOUDFLARE.md](./DEPLOY-CLOUDFLARE.md)** — sudah diuji build-nya | Fase komersial/SaaS |
| **Vercel + Google Sheets** (di bawah) | Ikuti panduan berikut | Demo & piloting |

### 1. Siapkan Google Sheets sebagai database (±10 menit)
1. [Google Cloud Console](https://console.cloud.google.com) → buat project (gratis).
2. **APIs & Services → Library** → cari & **Enable "Google Sheets API"**.
3. **IAM & Admin → Service Accounts** → **Create Service Account** → menu **Keys → Add Key → JSON** → unduh file JSON.
4. Buat spreadsheet baru di Google Drive → salin **ID** dari URL:
   `https://docs.google.com/spreadsheets/d/`**`INILAH_ID_NYA`**`/edit`
5. Klik **Share** di spreadsheet → tambahkan **email service account** (yang ada di JSON, `client_email`) dengan peran **Editor**.

### 2. Deploy ke Vercel (gratis)
1. Push folder ini ke repository GitHub.
2. [vercel.com](https://vercel.com) → **Add New Project** → import repo (framework terdeteksi otomatis sebagai Next.js).
3. Tambahkan **Environment Variables**:

| Key | Value |
|---|---|
| `GOOGLE_SHEETS_ID` | ID spreadsheet dari langkah 1 |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Isi JSON service account **dalam satu baris** (atau base64) |
| `SESSION_SECRET` | string acak panjang (mis. hasil `openssl rand -hex 32`) |
| `PUBLIC_BASE_URL` | domain final, mis. `https://asesmen.sekolah.sch.id` |

4. **Deploy** → saat request pertama, app otomatis membuat tab per koleksi di spreadsheet.
5. (Opsional) Custom domain di menu Settings → Domains.

> **Catatan kuota:** Sheets API gratis sampai ±300 request/menit/proyek. Untuk 1 sekolah
> (ratusan siswa) sangat memadai karena ada cache 4 detik + operasi per-dokumen.
> Bila nanti skala ribuan pengguna, tambahkan adapter Postgres/Supabase di `lib/store/`
> tanpa mengubah kode halaman.

### 3. Checklist go-live
- [ ] `SESSION_SECRET` unik & rahasia
- [ ] Ganti password akun guru default / daftar sekolah baru via `/daftar`
- [ ] Import CP lengkap BSKAP 046/H/KR/2025 ke tab `cp`
- [ ] Isi kolom **No. WA** siswa agar tombol pengumuman WhatsApp aktif
- [ ] Set `PUBLIC_BASE_URL` agar QR & link asesmen memakai domain final

## 🗺️ Roadmap lanjutan (arah SaaS)

- [ ] Multi-tenant penuh: subdomain per sekolah + billing/langganan
- [ ] Jawaban essay berupa **foto/gambar** (perlu object storage — Supabase Storage / S3 — karena Google Sheets tidak cocok untuk blob)
- [ ] Pengiriman pengumuman **otomatis** via WhatsApp Business API (saat ini memakai wa.me click-to-chat tanpa biaya)
- [ ] Export nilai ke format e-Rapor / AN
- [ ] SSL custom domain + backup spreadsheet terjadwal

## ⚠️ Catatan

- Teks CP di data demo adalah **ringkasan contoh** dari BSKAP 046/H/KR/2025 — untuk produksi,
  impor CP lengkap per mapel/fase ke tab `cp` (kolom: fase, mapel, elemen, kode, teks, sumber).
- Password demo bersifat contoh; untuk produksi aktifkan aturan kebijakan password & reset.
