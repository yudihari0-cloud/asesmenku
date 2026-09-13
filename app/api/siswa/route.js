import { ctx, ok, bad, requireUser, safeUser } from '@/lib/api';
import { hashPw } from '@/lib/auth';
import { id } from '@/lib/ids';

export async function GET(req) {
  const { store, user } = await ctx(req);
  const gate = requireUser(user);
  if (gate) return gate;
  const { searchParams } = new URL(req.url);
  const kelasId = searchParams.get('kelasId');
  const sekolahku = user.sekolahId || 'demo';
  let siswa = (await store.list('users')).filter(
    (u) => u.role === 'siswa' && (user.role === 'admin' || (u.sekolahId || 'demo') === sekolahku)
  );
  if (kelasId) siswa = siswa.filter((s) => s.kelasId === kelasId);
  const kelas = await store.list('kelas');
  return ok({
    siswa: siswa.map((s) => ({
      ...safeUser(s),
      kelasNama: kelas.find((k) => k.id === s.kelasId)?.nama || '-',
    })),
  });
}

export async function POST(req) {
  const { store, user } = await ctx(req);
  const gate = requireUser(user, ['guru', 'admin']);
  if (gate) return gate;
  const b = await req.json().catch(() => ({}));
  if (!b.nama || !b.nisn) return bad('Nama dan NISN wajib diisi');
  const users = await store.list('users');
  if (users.some((u) => u.nisn === String(b.nisn).trim())) return bad('NISN sudah terdaftar');
  let wa = String(b.wa || '').replace(/\D/g, '');
  if (wa.startsWith('0')) wa = '62' + wa.slice(1);
  else if (wa.startsWith('8')) wa = '62' + wa;
  const siswa = {
    id: id('sw'),
    role: 'siswa',
    nama: String(b.nama).trim(),
    username: String(b.nisn).trim(),
    nisn: String(b.nisn).trim(),
    kelasId: b.kelasId || '',
    wa: wa.length >= 9 ? wa : '',
    sekolahId: user.sekolahId || 'demo',
    pwHash: hashPw(b.password || '123456'),
    createdAt: new Date().toISOString(),
  };
  await store.insert('users', siswa);
  return ok({ siswa: safeUser(siswa) });
}

export async function DELETE(req) {
  const { store, user } = await ctx(req);
  const gate = requireUser(user, ['guru', 'admin']);
  if (gate) return gate;
  const { searchParams } = new URL(req.url);
  const sid = searchParams.get('id');
  if (!sid) return bad('Parameter id wajib');
  await store.remove('users', sid);
  return ok({ done: true });
}
