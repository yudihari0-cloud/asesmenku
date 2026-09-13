import { ctx, ok, bad, safeUser, getOrigin } from '@/lib/api';
import { gradeAttempt, skorTampil } from '@/lib/grade';
import { sanitizeSoal, shuffle } from '@/lib/asesmen';
import { id } from '@/lib/ids';

/** Endpoint publik untuk siswa mengikuti asesmen via token/link */

async function loadByToken(store, tokenStr) {
  const asesmen = (await store.list('asesmen')).find(
    (a) => a.token === String(tokenStr).toUpperCase()
  );
  return asesmen || null;
}

function pesanStatus(asesmen) {
  const now = Date.now();
  if (asesmen.status === 'draft') return 'Asesmen belum dipublikasikan';
  if (asesmen.status === 'ditutup') return 'Asesmen sudah ditutup';
  if (asesmen.buka && now < new Date(asesmen.buka).getTime()) return 'Asesmen belum dibuka';
  if (asesmen.tutup && now > new Date(asesmen.tutup).getTime()) return 'Waktu asesmen sudah berakhir';
  return null;
}

export async function GET(req, { params }) {
  const { store, user } = await ctx(req);
  const { token } = await params;
  const asesmen = await loadByToken(store, token);
  if (!asesmen) return bad('Token asesmen tidak ditemukan', 404);

  const { searchParams } = new URL(req.url);
  const kisi = asesmen.kisiId ? await store.get('kisi', asesmen.kisiId) : null;

  // ----- Leaderboard untuk siswa -----
  if (searchParams.get('lb')) {
    const attempts = (await store.list('attempt')).filter((a) => a.asesmenId === asesmen.id && a.status !== 'berlangsung');
    const users = await store.list('users');
    const namaMap = Object.fromEntries(users.map((u) => [u.id, u.nama]));
    const rows = attempts
      .map((a) => ({ siswaId: a.siswaId, nama: namaMap[a.siswaId] || 'Siswa', skor: skorTampil(a) }))
      .filter((r) => r.skor != null)
      .sort((x, y) => y.skor - x.skor)
      .map((r, i) => ({
        ...r,
        peringkat: i + 1,
        nama: asesmen.anonimLeaderboard && r.siswaId !== user?.id ? `Peserta #${i + 1}` : r.nama,
        kamu: r.siswaId === user?.id,
      }))
      .slice(0, 30);
    return ok({ leaderboard: rows, anonim: asesmen.anonimLeaderboard });
  }

  const soalSemua = await store.list('soal');
  const soalList = (asesmen.soalIds || []).map((sid) => soalSemua.find((s) => s.id === sid)).filter(Boolean);
  const guru = await store.get('users', asesmen.guruId);

  const meta = {
    judul: asesmen.judul,
    mapel: kisi?.mapel || '-',
    guru: guru?.nama || 'Guru',
    durasiMenit: asesmen.durasiMenit,
    jumlahSoal: soalList.length,
    buka: asesmen.buka,
    tutup: asesmen.tutup,
    status: asesmen.status,
    adaEssay: soalList.some((s) => s.tipe === 'ESSAY'),
    refleksiQs: asesmen.refleksiQs || [],
    tampilkanHasil: asesmen.tampilkanHasil,
  };

  const blokir = pesanStatus(asesmen);
  const viewer = user?.role === 'siswa' ? safeUser(user) : null;

  // ----- Jika siswa sudah punya attempt, siapkan data pengerjaan/hasil -----
  let runner = null;
  if (viewer) {
    const attempt = (await store.list('attempt')).find(
      (a) => a.asesmenId === asesmen.id && a.siswaId === viewer.id
    );
    if (attempt && attempt.status === 'berlangsung') {
      if (blokir) {
        // jadwal ditutup saat pengerjaan — langsung dikumpulkan
        const soalList2 = attempt.soalOrder.map((sid) => soalSemua.find((s) => s.id === sid)).filter(Boolean);
        const hasil = gradeAttempt(soalList2, attempt);
        await store.update('attempt', attempt.id, {
          selesai: new Date().toISOString(),
          status: hasil.status,
          perSoal: hasil.perSoal,
          skorObjektif: hasil.skorObjektif,
          skorEssay: hasil.skorEssay,
          skorAkhir: hasil.skorAkhir,
        });
      } else {
        const order = attempt.soalOrder || [];
        const byId = Object.fromEntries(soalList.map((s) => [s.id, s]));
        const soal = order.map((sid) => byId[sid]).filter(Boolean).map((s) => {
          const sani = sanitizeSoal(s);
          const r = attempt.render?.[s.id];
          if (s.tipe === 'MENJODOKAN' && r?.kanan) {
            sani.kanan = r.kanan.map((i) => s.kanan[i]);
            sani.kananIds = r.kanan;
          }
          return sani;
        });
        const sisaDetik = Math.max(
          0,
          asesmen.durasiMenit * 60 - Math.floor((Date.now() - new Date(attempt.mulai).getTime()) / 1000)
        );
        runner = {
          attemptId: attempt.id,
          mulai: attempt.mulai,
          sisaDetik,
          soal,
          jawaban: attempt.jawaban || {},
        };
      }
    }
    const selesai = attempt && attempt.status !== 'berlangsung' ? attempt : null;
    const refleksiSudah = selesai
      ? (await store.list('refleksi')).some((r) => r.attemptId === selesai.id)
      : false;
    return ok({
      asesmen: meta,
      blokir,
      viewer,
      runner,
      refleksiSudah,
      hasil: selesai
        ? {
            status: selesai.status,
            skorObjektif: selesai.skorObjektif,
            skorEssay: selesai.skorEssay,
            skorAkhir: selesai.skorAkhir,
            selesaiPada: selesai.selesai,
          }
        : null,
      link: `${getOrigin(req)}/uji/${asesmen.token}`,
    });
  }

  return ok({ asesmen: meta, blokir, viewer: null, runner: null, hasil: null });
}

export async function POST(req, { params }) {
  const { store, user } = await ctx(req);
  const { token } = await params;
  const asesmen = await loadByToken(store, token);
  if (!asesmen) return bad('Token asesmen tidak ditemukan', 404);
  if (!user || user.role !== 'siswa') return bad('Login sebagai siswa untuk mengikuti asesmen', 401);
  const b = await req.json().catch(() => ({}));

  const soalSemua = await store.list('soal');
  const soalList = (asesmen.soalIds || []).map((sid) => soalSemua.find((s) => s.id === sid)).filter(Boolean);

  let attempt = (await store.list('attempt')).find(
    (a) => a.asesmenId === asesmen.id && a.siswaId === user.id
  );

  if (b.action === 'start') {
    if (attempt && attempt.status === 'berlangsung') return ok({ attemptId: attempt.id, lanjut: true });
    if (attempt) return bad('Kamu sudah mengikuti asesmen ini', 409);
    const blokir = pesanStatus(asesmen);
    if (blokir) return bad(blokir, 403);
    if (asesmen.token && b.tokenInput && String(b.tokenInput).toUpperCase() !== asesmen.token) {
      return bad('Token salah. Periksa kembali token dari gurumu.');
    }
    const order = asesmen.acakSoal !== false ? shuffle(soalList.map((s) => s.id)) : soalList.map((s) => s.id);
    // Simpan urutan opsi kanan (menjodohkan) agar konsisten saat reload
    const render = {};
    for (const s of soalList) {
      if (s.tipe === 'MENJODOKAN' && Array.isArray(s.kanan)) {
        render[s.id] = { kanan: shuffle(s.kanan.map((_, i) => i)) };
      }
    }
    attempt = {
      id: id('at'),
      asesmenId: asesmen.id,
      siswaId: user.id,
      kelasId: user.kelasId || '',
      mulai: new Date().toISOString(),
      selesai: null,
      status: 'berlangsung',
      soalOrder: order,
      jawaban: {},
      perSoal: {},
      render,
      skorObjektif: null,
      skorEssay: null,
      skorAkhir: null,
    };
    await store.insert('attempt', attempt);
    return ok({ attemptId: attempt.id, lanjut: false });
  }

  if (!attempt) return bad('Attempt tidak ditemukan — mulai asesmen dulu', 404);

  if (b.action === 'save') {
    if (attempt.status !== 'berlangsung') return bad('Asesmen sudah dikumpulkan');
    const lewat = Date.now() - new Date(attempt.mulai).getTime() > (asesmen.durasiMenit + 1) * 60000;
    if (lewat) return bad('Waktu sudah habis');
    const jawaban = { ...(attempt.jawaban || {}), ...(b.jawaban || {}) };
    await store.update('attempt', attempt.id, { jawaban });
    return ok({ saved: true });
  }

  if (b.action === 'submit') {
    if (attempt.status !== 'berlangsung') return ok({ sudah: true });
    const hasil = gradeAttempt(soalList, attempt);
    await store.update('attempt', attempt.id, {
      selesai: new Date().toISOString(),
      status: hasil.status,
      perSoal: hasil.perSoal,
      skorObjektif: hasil.skorObjektif,
      skorEssay: hasil.skorEssay,
      skorAkhir: hasil.skorAkhir,
    });
    return ok({
      skorObjektif: hasil.skorObjektif,
      skorEssay: hasil.skorEssay,
      skorAkhir: hasil.skorAkhir,
      adaEssay: hasil.adaEssay,
      tampilkanHasil: asesmen.tampilkanHasil,
    });
  }

  if (b.action === 'refleksi') {
    const sudah = (await store.list('refleksi')).find((r) => r.attemptId === attempt.id);
    if (sudah) return ok({ saved: true });
    await store.insert('refleksi', {
      id: id('rf'),
      asesmenId: asesmen.id,
      siswaId: user.id,
      attemptId: attempt.id,
      jawaban: b.jawaban || {},
      createdAt: new Date().toISOString(),
    });
    return ok({ saved: true });
  }

  return bad('Aksi tidak dikenal');
}
