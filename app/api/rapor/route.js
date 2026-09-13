import { ctx, ok, bad, requireUser } from '@/lib/api';
import { raporXlsx } from '@/lib/excel';

const r2 = (n) => Math.round(n * 100) / 100;

/**
 * GET /api/rapor?siswaId=... [&export=1]
 * Rapor mini: nilai seluruh asesmen yang diikuti siswa + penguasaan indikator agregat.
 */
export async function GET(req) {
  const { store, user } = await ctx(req);
  const gate = requireUser(user, ['guru', 'admin']);
  if (gate) return gate;
  const { searchParams } = new URL(req.url);
  const siswaId = searchParams.get('siswaId');
  const siswa = await store.get('users', siswaId);
  if (!siswa || siswa.role !== 'siswa') return bad('Siswa tidak ditemukan', 404);
  if (user.role !== 'admin' && (siswa.sekolahId || 'demo') !== (user.sekolahId || 'demo')) {
    return bad('Akses ditolak', 403);
  }

  const users = await store.list('users');
  const kelasList = await store.list('kelas');
  const kelasNama = kelasList.find((k) => k.id === siswa.kelasId)?.nama || '-';
  const semuaAsesmen = await store.list('asesmen');
  const kisiList = await store.list('kisi');
  const soalSemua = await store.list('soal');
  const attempts = (await store.list('attempt')).filter((a) => a.siswaId === siswa.id);

  // ----- Nilai per asesmen -----
  const rows = semuaAsesmen
    .filter((a) => a.status !== 'draft' && (a.kelasIds || []).includes(siswa.kelasId))
    .map((a) => {
      const at = attempts.find((x) => x.asesmenId === a.id);
      const kisi = kisiList.find((k) => k.id === a.kisiId);
      let statusLabel = 'Belum mengikuti';
      if (at) {
        if (at.status === 'selesai') statusLabel = 'Menunggu koreksi essay';
        else if (at.status === 'berlangsung') statusLabel = 'Sedang mengerjakan';
        else {
          const skor = at.skorAkhir ?? at.skorObjektif;
          statusLabel = skor != null && skor >= a.kktp ? 'Tuntas' : 'Belum tuntas';
        }
      }
      return {
        asesmenId: a.id,
        judul: a.judul,
        mapel: kisi?.mapel || '-',
        guru: users.find((u) => u.id === a.guruId)?.nama || '-',
        kktp: a.kktp,
        skor: at && at.status !== 'berlangsung' ? (at.skorAkhir ?? at.skorObjektif) : null,
        status: at?.status || 'belum',
        statusLabel,
        selesai: at?.selesai || null,
      };
    })
    .sort((a, b) => (a.selesai || '').localeCompare(b.selesai || ''));

  // ----- Penguasaan indikator agregat (lintas asesmen) -----
  const agg = {};
  for (const at of attempts) {
    for (const [sid, v] of Object.entries(at.perSoal || {})) {
      const so = soalSemua.find((s) => s.id === sid);
      if (!so || !so.kisiItemId) continue;
      agg[so.kisiItemId] = agg[so.kisiItemId] || { dapat: 0, max: 0 };
      agg[so.kisiItemId].dapat += v.dapat || 0;
      agg[so.kisiItemId].max += v.max || 0;
    }
  }
  const mastery = [];
  for (const kisi of kisiList) {
    for (const it of kisi.items || []) {
      const a = agg[it.id];
      if (!a || !a.max) continue;
      const persen = r2((a.dapat / a.max) * 100);
      mastery.push({
        kisiJudul: kisi.judul,
        mapel: kisi.mapel || '-',
        indikator: it.indikator,
        level: it.level,
        persen,
        kategori: persen >= 75 ? 'Tuntas' : persen >= 50 ? 'Perlu penguatan' : 'Remedial',
      });
    }
  }
  mastery.sort((a, b) => a.persen - b.persen);

  const skorValid = rows.filter((r) => r.skor != null).map((r) => r.skor);
  const ringkas = {
    rata: skorValid.length ? r2(skorValid.reduce((x, y) => x + y, 0) / skorValid.length) : null,
    ikut: skorValid.length,
    tuntas: rows.filter((r) => r.skor != null && r.skor >= r.kktp).length,
    tertinggi: skorValid.length ? Math.max(...skorValid) : null,
    terendah: skorValid.length ? Math.min(...skorValid) : null,
  };

  if (searchParams.get('export')) {
    return raporXlsx({ siswa, kelasNama, rows, mastery, ringkas });
  }

  const sekolah = (await store.list('sekolah')).find((s) => s.id === (user.sekolahId || 'demo')) || null;

  return ok({
    siswa: { id: siswa.id, nama: siswa.nama, nisn: siswa.nisn, wa: siswa.wa || '' },
    kelasNama,
    rows,
    mastery,
    ringkas,
    sekolah: sekolah ? { nama: sekolah.nama, alamat: sekolah.alamat || '', logo: sekolah.logo || null } : null,
    guruInfo: { nama: user.nama, nip: user.nip || '', jabatan: user.jabatan || '' },
  });
}
