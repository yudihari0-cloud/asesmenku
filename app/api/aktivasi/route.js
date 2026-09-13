import { ctx, ok, bad } from '@/lib/api';
import { id, kodeAktivasi } from '@/lib/ids';

/**
 * Panel admin — pengelolaan kode aktivasi (ASMT-XXXX-XXXX).
 * GET    — daftar semua kode + ringkasan sekolah
 * POST   — generate kode baru { jumlah, dibuatUntuk? }
 * DELETE — hapus kode yang masih tersedia (?id=)
 */
function guard(user) {
  return user && user.role !== 'siswa' && user.admin === true ? null : bad('Halaman khusus admin', 403);
}

export async function GET(req) {
  const { store, user } = await ctx(req);
  const g = guard(user);
  if (g) return g;

  const codes = await store.list('aktivasi');
  codes.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  const sekolahs = (await store.list('sekolah')).map((s) => ({
    id: s.id,
    nama: s.nama,
    masaAktifSampai: s.masaAktifSampai || '',
  }));
  return ok({ codes, sekolahs });
}

export async function POST(req) {
  const { store, user } = await ctx(req);
  const g = guard(user);
  if (g) return g;

  const b = await req.json().catch(() => ({}));
  const jumlah = Math.max(1, Math.min(50, parseInt(b.jumlah, 10) || 1));
  const dibuatUntuk = String(b.dibuatUntuk || '').trim().slice(0, 80);
  const now = new Date().toISOString();
  const codes = [];
  for (let i = 0; i < jumlah; i++) {
    const doc = {
      id: id('ak'),
      kode: kodeAktivasi(),
      status: 'tersedia',
      dibuatUntuk,
      dipakaiSekolahId: '',
      dipakaiOleh: '',
      activatedAt: '',
      kedaluwarsa: '',
      createdAt: now,
    };
    await store.insert('aktivasi', doc);
    codes.push(doc);
  }
  return ok({ codes });
}

export async function DELETE(req) {
  const { store, user } = await ctx(req);
  const g = guard(user);
  if (g) return g;

  const { searchParams } = new URL(req.url);
  const delId = searchParams.get('id');
  const c = delId && (await store.get('aktivasi', delId));
  if (!c) return bad('Kode tidak ditemukan', 404);
  if (c.status !== 'tersedia') return bad('Kode sudah dipakai — tidak bisa dihapus');
  await store.remove('aktivasi', delId);
  return ok({ done: true });
}
