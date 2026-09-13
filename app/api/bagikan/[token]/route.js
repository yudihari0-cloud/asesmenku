import { boot } from '@/lib/store';
import { ok, bad } from '@/lib/api';
import { hitungRekap } from '@/lib/asesmen';
import { analisisButir } from '@/lib/analisis';
import { skorTampil } from '@/lib/grade';

/**
 * GET /api/bagikan/[token] — PUBLIK (tanpa login).
 * Hasil asesmen versi ringkas untuk dibagikan: rekap, leaderboard, analisis indikator & butir.
 * Tanpa data pribadi sensitif (tanpa NISN, jawaban, refleksi); nama mengikuti mode anonim.
 */
export async function GET(req, { params }) {
  const store = await boot();
  const { token } = await params;
  const asesmen = (await store.list('asesmen')).find((a) => a.token === String(token).toUpperCase());
  if (!asesmen || asesmen.status === 'draft') return bad('Hasil asesmen tidak tersedia', 404);

  const kisi = asesmen.kisiId ? await store.get('kisi', asesmen.kisiId) : null;
  const soalSemua = await store.list('soal');
  const soalList = (asesmen.soalIds || []).map((sid) => soalSemua.find((s) => s.id === sid)).filter(Boolean);
  const attempts = (await store.list('attempt')).filter((a) => a.asesmenId === asesmen.id && a.status !== 'berlangsung');
  const users = await store.list('users');
  const kelasList = await store.list('kelas');
  const siswaList = users.filter((u) => u.role === 'siswa' && (asesmen.kelasIds || []).includes(u.kelasId));

  const { mastery, ringkas } = hitungRekap(asesmen, kisi || { items: [] }, soalList, attempts, siswaList, kelasList);
  const butir = analisisButir(soalList, attempts);

  const leaderboard = attempts
    .map((a) => ({ siswaId: a.siswaId, skor: skorTampil(a) }))
    .filter((r) => r.skor != null)
    .sort((x, y) => y.skor - x.skor)
    .map((r, i) => ({
      peringkat: i + 1,
      nama: asesmen.anonimLeaderboard ? `Peserta #${i + 1}` : users.find((u) => u.id === r.siswaId)?.nama || 'Siswa',
      skor: r.skor,
    }))
    .slice(0, 50);

  const guru = users.find((u) => u.id === asesmen.guruId);
  const sekolah = (await store.list('sekolah')).find((s) => s.id === (guru?.sekolahId || 'demo')) || null;

  return ok({
    judul: asesmen.judul,
    mapel: kisi?.mapel || '-',
    guru: guru?.nama || '-',
    nip: guru?.nip || '',
    jabatan: guru?.jabatan || '',
    sekolah: sekolah ? { nama: sekolah.nama, alamat: sekolah.alamat || '', logo: sekolah.logo || null } : null,
    kktp: asesmen.kktp,
    status: asesmen.status,
    anonim: !!asesmen.anonimLeaderboard,
    ringkas,
    leaderboard,
    mastery,
    butir,
  });
}
