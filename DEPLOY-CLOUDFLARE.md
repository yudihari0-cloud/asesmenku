# 🚀 Panduan Deploy AsesmenKu ke Cloudflare Workers

> ✅ **Sudah diuji**: proyek ini sudah dipastikan lolos `opennextjs-cloudflare build`
> (worker berhasil dibundel) dan seluruh fitur lolos uji regresi pada Next.js 15 —
> versi yang dibutuhkan adapter Cloudflare terbaru.
>
> **Biaya: Rp0** (Workers Free) untuk skala 1 sekolah. Upgrade $5/bln hanya jika
> nanti bundle melebihi batas free (lihat bagian *Batasan & Biaya*).

---

## 0. Prasyarat

| Kebutuhan | Keterangan |
|---|---|
| Akun Cloudflare | Daftar gratis di [dash.cloudflare.com](https://dash.cloudflare.com) |
| Node.js **≥ 22** | Cek: `node --version`. Bila di bawah, pasang via [nvm](https://github.com/nvm-sh/nvm): `nvm install 22 && nvm use 22` |
| npm | Ikut Node.js |
| Google Sheets kosong | Sebagai database (langkah 1) |

> ⚠️ **WAJIB MEMAHAMI DULU**: di Cloudflare Workers **tidak ada filesystem**.
> Mode penyimpanan JSON lokal (demo) **tidak akan berfungsi**. Database **wajib**
> memakai Google Sheets — ikuti Langkah 1 dengan lengkap sebelum deploy.
> (Kode aplikasi sudah saya siapkan: penandatanganan OAuth Google memakai
> WebCrypto yang native di Workers, dan mode demo akan memberi pesan jelas
> bila env belum diisi.)

---

## 1. Siapkan Database Google Sheets (±10 menit)

1. [Google Cloud Console](https://console.cloud.google.com) → buat project.
2. **APIs & Services → Library** → aktifkan **Google Sheets API**.
3. **IAM & Admin → Service Accounts** → buat service account → **Keys → Add Key → JSON** → unduh.
4. Buat spreadsheet baru → salin **ID** dari URL:
   `https://docs.google.com/spreadsheets/d/`**`INILAH_ID_NYA`**`/edit`
5. Klik **Share** → tambahkan **email service account** (`client_email` di file JSON) → peran **Editor**.
6. Siapkan nilai berikut untuk dipakai di Langkah 4:
   - `GOOGLE_SHEETS_ID` = ID spreadsheet
   - `GOOGLE_SERVICE_ACCOUNT_JSON` = **seluruh isi JSON service account**. Paling aman
     dikonversi base64 satu baris: `base64 -w0 service-account.json` (macOS: `base64 -i file.json`)

---

## 2. Dependensi & Konfigurasi (sudah disiapkan di proyek ✅)

Proyek ini **sudah berisi** semua file yang dibutuhkan Cloudflare:

| File | Fungsi |
|---|---|
| `wrangler.jsonc` | Konfigurasi Worker (`nodejs_compat`, compatibility date ≥ 2025-04-01, binding assets) |
| `open-next.config.ts` | Konfigurasi adapter OpenNext |
| `package.json` → `cf:preview` / `cf:deploy` | Skrip build & deploy |
| Next.js **15** | Versi minimum yang didukung adapter terbaru (sudah dimigrasi & diuji) |

Cukup install dependensinya (sekali):

```bash
npm install
```

---

## 3. Login Cloudflare (sekali saja)

```bash
npx wrangler login
```

Browser terbuka → klik **Allow**.

---

## 4. Deploy!

```bash
npm run cf:deploy
```

Perintah ini akan: build Next.js → transform via OpenNext → unggah ke Cloudflare.
Di akhir muncul URL sementara seperti:

```
https://asesmenku.<subdomain-anda>.workers.dev
```

> Di penyaluran pertama, aplikasi akan menampilkan error jika dibuka — **normal**,
> karena secrets belum diisi. Lanjut ke Langkah 5.

---

## 5. Isi Secrets (Environment Variables)

Jalankan **4 perintah** ini satu per satu (tempel nilai → Enter):

```bash
npx wrangler secret put SESSION_SECRET              # string acak: openssl rand -hex 32
npx wrangler secret put GOOGLE_SHEETS_ID            # ID spreadsheet
npx wrangler secret put GOOGLE_SERVICE_ACCOUNT_JSON # hasil base64 -w0 file JSON
npx wrangler secret put PUBLIC_BASE_URL             # mis. https://asesmenku.xxx.workers.dev
```

Alternatif via dashboard: **Workers & Pages → asesmenku → Settings → Variables and Secrets → Add**.
Secrets berlaku **langsung** tanpa deploy ulang.

**Tes sekarang:** buka URL workers.dev → halaman login muncul → login `yudi / guru123`
→ data demo otomatis ter-seed ke spreadsheet Anda (cek tab `users`, `kelas`, dll. di Google Sheets).

---

## 6. (Opsional) Domain Sendiri

1. Dashboard → **Workers & Pages → asesmenku → Settings → Domains & Routes → Add → Custom domain**.
2. Isi mis. `ujian.sekolah.sch.id` (domain harus ada di Cloudflare DNS; untuk .sch.id
   arahkan NS/domain ke Cloudflare dulu, atau pakai CNAME flattening).
3. SSL otomatis. Setelah itu perbarui secret: `npx wrangler secret put PUBLIC_BASE_URL`
   → isi `https://ujian.sekolah.sch.id` agar QR & link asesmen memakai domain final.

---

## 7. Checklist Pasca-Deploy (±5 menit)

- [ ] Buka `/login` → login guru `yudi / guru123` → ganti password & isi **Profil & Sekolah**
- [ ] **Kelas & Siswa** → unduh template → import siswa sungguhan
- [ ] **Kisi-Kisi Maker** → **Import Master CP** (Fase sesuai jenjang sekolah)
- [ ] Buat kisi-kisi → bank soal → asesmen → **Publikasikan**
- [ ] Dari HP: buka link `/uji/TOKEN` → login siswa → kerjakan → submit
- [ ] Cek spreadsheet: tab `attempt` & `refleksi` terisi otomatis
- [ ] Buka `/bagikan/TOKEN` → hasil publik tampil

---

## 8. Update Aplikasi ke Semua Depan

Data tersimpan di Google Sheets — **aman saat redeploy**:

```bash
git pull            # bila pakai repo
npm install
npm run cf:deploy
```

Otomatis via GitHub (disarankan untuk SaaS): dashboard → **Workers & Pages → Create →
Workers → Connect to Git** → pilih repo → build command `npm run cf:deploy` terdeteksi
otomatis. Setiap `git push` langsung tayang.

---

## ⚠️ Batasan & Biaya

| Item | Free ($0) | Paid ($5/bln) |
|---|---|---|
| Request | **100.000/hari** (sangat cukup 1 sekolah) | 10 juta/bln |
| Batas ukuran script | 3 MB gzip | 15 MB |
| Komersial | ✅ **Boleh** | ✅ |

- Bila deploy ditolak dengan *“script size exceeds the limit”* → bundle melebihi 3 MB.
  Solusi termurah: **Workers Paid $5/bln** (masih jauh lebih murah dari VPS).
- Build di **Windows** belum didukung penuh adapter → pakai WSL, atau deploy via
  GitHub Workers Builds (build berjalan di server Cloudflare).

---

## 🔧 Troubleshooting

| Gejala | Penyebab & Solusi |
|---|---|
| **Error 1101** saat dibuka | Runtime error — jalankan `npx wrangler tail` untuk log real-time. Paling sering: secrets belum di-set, atau spreadsheet belum di-share ke service account (Editor). |
| `Cannot read properties of undefined (reading 'MY_VAR')` | Env tidak terbaca — pastikan `compatibility_date` ≥ `2025-04-01` (sudah di `wrangler.jsonc`). |
| `Gagal OAuth Google: invalid_grant` | `GOOGLE_SERVICE_ACCOUNT_JSON` rusak saat ditempel. Gunakan `base64 -w0 file.json` lalu tempel hasilnya sebagai satu baris. |
| `Penyimpanan file lokal tidak tersedia…` | Env `GOOGLE_SHEETS_ID` / `GOOGLE_SERVICE_ACCOUNT_JSON` belum di-set (mode demo tidak ada di Workers). |
| `403 permission` dari Google | Spreadsheet belum di-share ke email service account, atau Sheets API belum diaktifkan. |
| `Wrangler requires Node.js v22` | Naikkan Node: `nvm install 22 && nvm use 22`. |
| Data hilang setelah beberapa saat | Anda membuka mode demo tanpa env — pastikan kedua env Google terisi. |

---

## Ringkasan Perintah (cheat sheet)

```bash
nvm use 22                    # Node ≥ 22 untuk wrangler
npm install
npx wrangler login
npm run cf:preview            # uji lokal dengan runtime Workers (opsional)
npm run cf:deploy             # deploy ke Cloudflare
npx wrangler secret put NAMA  # set secret (4 buah)
npx wrangler tail             # lihat log real-time
npx wrangler deployments list # riwayat deploy
```
