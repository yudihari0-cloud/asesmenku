import { ctx, ok, bad, requireUser, safeUser } from '@/lib/api';
import { skorTampil } from '@/lib/grade';

/** GET — daftar asesmen untuk siswa yang sedang login (kelasnya) */
export async function GET(req) {
  const { store, user } = await ctx(req);
  const gate = requireUser(user, ['siswa']);
  if (gate) return gate;

  const kelasNama = (await store.list('kelas')).find((k) => k.id === user.kelasId)?.nama || '-';
  const semua = await store.list('asesmen');
  const kisiList = await store.list('kisi');
  const users = await store.list('users');
  const attempts = (await store.list('attempt')).filter((a) => a.siswaId === user.id);

  const daftar = semua
    .filter((a) => a.status !== 'draft' && (a.kelasIds || []).includes(user.kelasId))
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    .map((a) => {
      const attempt = attempts.find((x) => x.asesmenId === a.id) || null;
      return {
        id: a.id,
        token: a.token,
        judul: a.judul,
        mapel: kisiList.find((k) => k.id === a.kisiId)?.mapel || '-',
        guru: users.find((u) => u.id === a.guruId)?.nama || 'Guru',
        jumlahSoal: (a.soalIds || []).length,
        durasiMenit: a.durasiMenit,
        tutup: a.tutup,
        status: a.status,
        kktp: a.kktp,
        attempt: attempt ? { id: attempt.id, status: attempt.status } : null,
        skorTampil: attempt && attempt.status !== 'berlangsung' ? skorTampil(attempt) : null,
      };
    });

  return ok({ siswa: { ...safeUser(user), kelasNama }, asesmen: daftar });
}
