import { boot } from '@/lib/store';
import { hashPw } from '@/lib/auth';
import { id } from '@/lib/ids';
import { ok, bad } from '@/lib/api';

/**
 * POST — registrasi sekolah baru (langkah awal multi-tenant/SaaS).
 * Membuat sekolahId baru + akun guru pertama. Data antar sekolah terpisah.
 */
export async function POST(req) {
  const store = await boot();
  const b = await req.json().catch(() => ({}));
  const sekolah = String(b.sekolah || '').trim();
  const nama = String(b.nama || '').trim();
  const username = String(b.username || '').trim().toLowerCase();
  const password = String(b.password || '');

  if (!sekolah || !nama || !username || !password) return bad('Semua kolom wajib diisi');
  if (password.length < 6) return bad('Password minimal 6 karakter');
  if (!/^[a-z0-9._-]{4,24}$/.test(username)) {
    return bad('Username 4–24 karakter, hanya huruf kecil, angka, titik, garis bawah atau strip');
  }

  const users = await store.list('users');
  if (users.some((u) => (u.username || '').toLowerCase() === username)) {
    return bad('Username sudah dipakai — pilih yang lain');
  }

  const sekolahId = id('sk');
  const guru = {
    id: id('g'),
    role: 'guru',
    nama,
    username,
    sekolahId,
    namaSekolah: sekolah,
    pwHash: hashPw(password),
    createdAt: new Date().toISOString(),
  };
  await store.insert('users', guru);
  return ok({ done: true, username: guru.username });
}
