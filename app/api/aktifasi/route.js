import { ctx, ok, bad } from '@/lib/api';

const TAHUN_MS = 365 * 864e5;

/**
 * POST — perpanjang masa aktif sekolah yang sedang login dengan kode aktivasi.
 * Masa aktif baru = (masa aktif terakhir atau hari ini, yang lebih besar) + 1 tahun.
 */
export async function POST(req) {
  const { store, user } = await ctx(req);
  if (!user || user.role === 'siswa') return bad('Login sebagai guru dulu', 401);

  const b = await req.json().catch(() => ({}));
  const kode = String(b.kode || '').trim().toUpperCase();
  if (!kode) return bad('Isi kode aktivasi');

  const semua = await store.list('aktivasi');
  const c = semua.find((x) => (x.kode || '').toUpperCase() === kode);
  if (!c) return bad('Kode tidak dikenal — periksa penulisanannya', 404);
  if (c.status !== 'tersedia') return bad('Kode ini sudah pernah dipakai', 409);

  const sekolahId = user.sekolahId || 'demo';
  const sekolah = await store.get('sekolah', sekolahId);
  if (!sekolah) return bad('Data sekolah tidak ditemukan', 404);

  const now = Date.now();
  const dasar = sekolah.masaAktifSampai ? Math.max(now, new Date(sekolah.masaAktifSampai).getTime()) : now;
  const sampai = new Date(dasar + TAHUN_MS).toISOString();

  await store.update('sekolah', sekolahId, { masaAktifSampai: sampai });
  await store.update('aktivasi', c.id, {
    status: 'terpakai',
    dipakaiSekolahId: sekolahId,
    dipakaiOleh: user.nama || user.username,
    activatedAt: new Date(now).toISOString(),
    kedaluwarsa: sampai,
  });

  return ok({ masaAktifSampai: sampai, namaSekolah: sekolah.nama });
}
