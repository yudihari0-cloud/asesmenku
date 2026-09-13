import { boot } from '@/lib/store';
import { hashPw } from '@/lib/auth';
import { id } from '@/lib/ids';
import { ok, bad } from '@/lib/api';

const TAHUN_MS = 365 * 864e5;

/**
 * POST — registrasi sekolah baru (multi-tenant/SaaS).
 * Wajib memakai KODE AKTIVASI (ASMT-XXXX-XXXX) yang dibeli dari admin.
 * Membuat record sekolah (masa aktif 1 tahun) + akun guru pertama.
 */
export async function POST(req) {
  const store = await boot();
  const b = await req.json().catch(() => ({}));
  const kode = String(b.kode || '').trim().toUpperCase();
  const sekolahNama = String(b.sekolah || '').trim();
  const nama = String(b.nama || '').trim();
  const username = String(b.username || '').trim().toLowerCase();
  const password = String(b.password || '');

  if (!kode || !sekolahNama || !nama || !username || !password) return bad('Semua kolom wajib diisi, termasuk kode aktivasi');
  if (password.length < 6) return bad('Password minimal 6 karakter');
  if (!/^[a-z0-9._-]{4,24}$/.test(username)) {
    return bad('Username 4–24 karakter, hanya huruf kecil, angka, titik, garis bawah atau strip');
  }

  const codes = await store.list('aktivasi');
  const c = codes.find((x) => (x.kode || '').toUpperCase() === kode);
  if (!c) return bad('Kode aktivasi tidak dikenal — periksa penulisanannya', 404);
  if (c.status !== 'tersedia') return bad('Kode aktivasi sudah pernah dipakai', 409);

  const users = await store.list('users');
  if (users.some((u) => (u.username || '').toLowerCase() === username)) {
    return bad('Username sudah dipakai — pilih yang lain');
  }

  const now = new Date().toISOString();
  const masaAktifSampai = new Date(Date.now() + TAHUN_MS).toISOString();

  const sekolahId = id('sk');
  await store.insert('sekolah', {
    id: sekolahId,
    nama: sekolahNama,
    alamat: '',
    logo: '',
    masaAktifSampai,
    createdAt: now,
  });

  const guru = {
    id: id('g'),
    role: 'guru',
    nama,
    username,
    sekolahId,
    namaSekolah: sekolahNama,
    wa: String(b.wa || '').trim(),
    pwHash: hashPw(password),
    createdAt: now,
  };
  await store.insert('users', guru);

  await store.update('aktivasi', c.id, {
    status: 'terpakai',
    dipakaiSekolahId: sekolahId,
    dipakaiOleh: nama,
    activatedAt: now,
    kedaluwarsa: masaAktifSampai,
  });

  return ok({ done: true, username: guru.username, masaAktifSampai });
}
