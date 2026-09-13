import { ctx, ok, bad, requireUser } from '@/lib/api';
import { id } from '@/lib/ids';

export async function GET(req) {
  const { store, user } = await ctx(req);
  const gate = requireUser(user);
  if (gate) return gate;
  const semuaKelas = await store.list('kelas');
  const kelas = user.role === 'admin' ? semuaKelas : semuaKelas.filter((k) => (k.sekolahId || 'demo') === (user.sekolahId || 'demo') || k.guruId === user.id);
  const users = await store.list('users');
  const siswa = users.filter((u) => u.role === 'siswa');
  return ok({
    kelas: kelas.map((k) => ({
      ...k,
      jumlahSiswa: siswa.filter((s) => s.kelasId === k.id).length,
    })),
  });
}

export async function POST(req) {
  const { store, user } = await ctx(req);
  const gate = requireUser(user, ['guru', 'admin']);
  if (gate) return gate;
  const b = await req.json().catch(() => ({}));
  if (!b.nama) return bad('Nama kelas wajib diisi');
  const kelas = {
    id: id('k'),
    nama: String(b.nama).trim(),
    tingkat: b.tingkat || 8,
    fase: b.fase || 'D',
    sekolahId: user.sekolahId || 'demo',
    guruId: user.id,
  };
  await store.insert('kelas', kelas);
  return ok({ kelas });
}

export async function DELETE(req) {
  const { store, user } = await ctx(req);
  const gate = requireUser(user, ['guru', 'admin']);
  if (gate) return gate;
  const { searchParams } = new URL(req.url);
  const kelasId = searchParams.get('id');
  if (!kelasId) return bad('Parameter id wajib');
  // Lepaskan siswa dari kelas ini
  const users = await store.list('users');
  for (const s of users.filter((u) => u.role === 'siswa' && u.kelasId === kelasId)) {
    await store.update('users', s.id, { kelasId: '' });
  }
  await store.remove('kelas', kelasId);
  return ok({ done: true });
}
