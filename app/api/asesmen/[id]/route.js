import { ctx, ok, bad, requireUser, getOrigin } from '@/lib/api';
import { composeSoal, hitungRekap } from '@/lib/asesmen';
import { gradeAttempt, skorTampil } from '@/lib/grade';
import { analisisButir } from '@/lib/analisis';
import { rekapXlsx } from '@/lib/excel';

const MEDALI = ['🥇', '🥈', '🥉'];

function cekAkses(asesmen, user) {
  if (!asesmen) return 'Asesmen tidak ditemukan';
  if (user.role === 'siswa') return 'Akses ditolak';
  if (asesmen.guruId !== user.id && user.role !== 'admin') return 'Akses ditolak';
  return null;
}

export async function GET(req, { params }) {
  const { store, user } = await ctx(req);
  const gate = requireUser(user);
  if (gate) return gate;
  const { id: aid } = await params;
  const asesmen = await store.get('asesmen', aid);
  const tolak = cekAkses(asesmen, user);
  if (tolak) return bad(tolak, asesmen ? 403 : 404);
  const { searchParams } = new URL(req.url);

  const kisi = (await store.get('kisi', asesmen.kisiId)) || null;
  const soalSemua = await store.list('soal');
  const soalList = (asesmen.soalIds || []).map((sid) => soalSemua.find((s) => s.id === sid)).filter(Boolean);
  const attempts = (await store.list('attempt')).filter((a) => a.asesmenId === aid);
  const users = await store.list('users');
  const kelasList = await store.list('kelas');
  const siswaList = users.filter((u) => u.role === 'siswa' && asesmen.kelasIds.includes(u.kelasId));
  const namaMap = Object.fromEntries(users.map((u) => [u.id, u.nama]));

  const guruUser = users.find((u) => u.id === asesmen.guruId) || null;
  const sekolah = (await store.list('sekolah')).find((s) => s.id === (guruUser?.sekolahId || 'demo')) || null;
  const infoSekolah = {
    nama: sekolah?.nama || guruUser?.namaSekolah || '',
    alamat: sekolah?.alamat || '',
    logo: sekolah?.logo || null,
  };
  const infoGuru = {
    nama: guruUser?.nama || 'Guru',
    nip: guruUser?.nip || '',
    jabatan: guruUser?.jabatan || '',
  };

  const rekapHasil = hitungRekap(asesmen, kisi || { items: [] }, soalList, attempts, siswaList, kelasList);
  const butir = analisisButir(soalList, attempts);

  // ----- Export rekap ke Excel -----
  if (searchParams.get('export') === 'rekap') {
    return rekapXlsx({ asesmen, rows: rekapHasil.rows, mastery: rekapHasil.mastery, butir });
  }

  const { rows, mastery, ringkas } = rekapHasil;

  // ----- Leaderboard -----
  const lb = attempts
    .filter((a) => a.status !== 'berlangsung')
    .map((a) => ({ attemptId: a.id, siswaId: a.siswaId, nama: namaMap[a.siswaId] || 'Siswa', skor: skorTampil(a), essayPending: a.status === 'selesai' }))
    .sort((x, y) => y.skor - x.skor)
    .map((r, i) => ({
      ...r,
      peringkat: i + 1,
      nama: asesmen.anonimLeaderboard && r.siswaId !== user.id ? `Peserta #${i + 1}` : r.nama,
      medali: MEDALI[i] || null,
    }))
    .slice(0, 50);

  // ----- Koreksi essay: jawaban essay per attempt -----
  const essaySoal = soalList.filter((s) => s.tipe === 'ESSAY');
  const koreksi = attempts.map((a) => ({
    attemptId: a.id,
    siswaId: a.siswaId,
    nama: namaMap[a.siswaId] || 'Siswa',
    status: a.status,
    skorObjektif: a.skorObjektif,
    skorEssay: a.skorEssay,
    skorAkhir: a.skorAkhir,
    essays: essaySoal.map((s) => ({
      soalId: s.id,
      pertanyaan: s.pertanyaan,
      skorMax: s.skor,
      rubrik: s.kunciPoin || '',
      jawaban: (a.jawaban || {})[s.id] || '(tidak dijawab)',
      skor: a.perSoal?.[s.id]?.dapat ?? 0,
      sudahDinilai: !!(a.perSoal?.[s.id]?.manual && a.status === 'dinilai'),
    })),
  }));

  // ----- Refleksi -----
  const refleksi = await store.list('refleksi');
  const rAsesmen = refleksi.filter((r) => r.asesmenId === aid);
  const refleksiAgg = (asesmen.refleksiQs || []).map((q, qi) => ({
    q,
    jawaban: rAsesmen
      .map((r) => ({ nama: namaMap[r.siswaId] || 'Siswa', jawaban: (r.jawaban || {})['q' + qi] || '-', waktu: r.createdAt }))
      .reverse(),
  }));

  return ok({
    asesmen,
    kisi,
    soal: soalList,
    kelas: kelasList.filter((k) => asesmen.kelasIds.includes(k.id)).map((k) => ({ id: k.id, nama: k.nama })),
    rekap: { rows, mastery, ringkas },
    butir,
    leaderboard: lb,
    koreksi,
    refleksi: refleksiAgg,
    link: `${getOrigin(req)}/uji/${asesmen.token}`,
    attemptCount: attempts.length,
    sekolah: infoSekolah,
    guruInfo: infoGuru,
  });
}

export async function POST(req, { params }) {
  const { store, user } = await ctx(req);
  const gate = requireUser(user, ['guru', 'admin']);
  if (gate) return gate;
  const { id: aid } = await params;
  const asesmen = await store.get('asesmen', aid);
  const tolak = cekAkses(asesmen, user);
  if (tolak) return bad(tolak, asesmen ? 403 : 404);
  const b = await req.json().catch(() => ({}));

  switch (b.action) {
    case 'publish': {
      if (!(asesmen.soalIds || []).length) return bad('Belum ada soal dalam paket. Susun soal dulu.');
      const patch = { status: 'publik' };
      if (!asesmen.token) patch.token = 'AS' + Date.now().toString(36).toUpperCase().slice(-4);
      await store.update('asesmen', aid, patch);
      break;
    }
    case 'tutup':
      await store.update('asesmen', aid, { status: 'ditutup' });
      break;
    case 'buka':
      await store.update('asesmen', aid, { status: 'publik' });
      break;
    case 'update': {
      const patch = {};
      for (const k of ['judul', 'token', 'durasiMenit', 'buka', 'tutup', 'acakSoal', 'acakOpsi', 'tampilkanHasil', 'anonimLeaderboard', 'kktp', 'refleksiQs', 'kelasIds']) {
        if (b[k] !== undefined) patch[k] = k === 'durasiMenit' || k === 'kktp' ? Number(b[k]) : b[k];
      }
      if (patch.token) patch.token = String(patch.token).toUpperCase();
      await store.update('asesmen', aid, patch);
      break;
    }
    case 'compose': {
      const kisi = await store.get('kisi', asesmen.kisiId);
      if (!kisi) return bad('Kisi-kisi tidak ditemukan');
      const bank = (await store.list('soal')).filter((s) => s.kisiId === kisi.id);
      const soalIds = composeSoal(kisi, bank, asesmen.acakSoal !== false);
      await store.update('asesmen', aid, { soalIds });
      break;
    }
    case 'tambahSoal': {
      const set = new Set(asesmen.soalIds || []);
      if (set.has(b.soalId)) return bad('Soal sudah ada dalam paket');
      set.add(b.soalId);
      await store.update('asesmen', aid, { soalIds: [...set] });
      break;
    }
    case 'hapusSoal': {
      await store.update('asesmen', aid, { soalIds: (asesmen.soalIds || []).filter((x) => x !== b.soalId) });
      break;
    }
    case 'grade': {
      const attempt = await store.get('attempt', b.attemptId);
      if (!attempt || attempt.asesmenId !== aid) return bad('Attempt tidak ditemukan', 404);
      const soalSemua = await store.list('soal');
      const soalList = (asesmen.soalIds || []).map((sid) => soalSemua.find((s) => s.id === sid)).filter(Boolean);
      const scores = b.scores || {};
      const jawabanEssay = {};
      for (const [sid, val] of Object.entries(scores)) {
        const s = soalList.find((x) => x.id === sid);
        if (!s || s.tipe !== 'ESSAY') continue;
        const max = s.skor || 0;
        jawabanEssay[sid] = Math.max(0, Math.min(max, Number(val) || 0));
      }
      const perSoal = { ...(attempt.perSoal || {}) };
      for (const [sid, dapat] of Object.entries(jawabanEssay)) {
        perSoal[sid] = { ...(perSoal[sid] || {}), dapat, manual: true };
      }
      const hasil = gradeAttempt(soalList, { ...attempt, perSoal });
      await store.update('attempt', attempt.id, {
        perSoal,
        skorObjektif: hasil.skorObjektif,
        skorEssay: hasil.skorEssay,
        skorAkhir: hasil.skorAkhir,
        status: 'dinilai',
      });
      break;
    }
    default:
      return bad('Aksi tidak dikenal');
  }
  return ok({ done: true });
}

export async function DELETE(req, { params }) {
  const { store, user } = await ctx(req);
  const gate = requireUser(user, ['guru', 'admin']);
  if (gate) return gate;
  const { id: aid } = await params;
  const asesmen = await store.get('asesmen', aid);
  const tolak = cekAkses(asesmen, user);
  if (tolak) return bad(tolak, asesmen ? 403 : 404);
  for (const a of await store.list('attempt')) if (a.asesmenId === aid) await store.remove('attempt', a.id);
  for (const r of await store.list('refleksi')) if (r.asesmenId === aid) await store.remove('refleksi', r.id);
  await store.remove('asesmen', aid);
  return ok({ done: true });
}
