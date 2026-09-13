import { ctx, ok, bad, requireUser } from '@/lib/api';
import { id } from '@/lib/ids';
import { TIPE_SOAL } from '@/lib/grade';

export async function GET(req) {
  const { store, user } = await ctx(req);
  const gate = requireUser(user);
  if (gate) return gate;
  const { searchParams } = new URL(req.url);
  let soal = (await store.list('soal')).filter((s) => s.guruId === user.id || user.role === 'admin');
  const kisiId = searchParams.get('kisiId');
  const tipe = searchParams.get('tipe');
  if (kisiId) soal = soal.filter((s) => s.kisiId === kisiId);
  if (tipe) soal = soal.filter((s) => s.tipe === tipe);
  return ok({ soal });
}

function validasi(b) {
  if (!TIPE_SOAL.includes(b.tipe)) return 'Tipe soal tidak valid';
  if (!b.pertanyaan) return 'Pertanyaan wajib diisi';
  if (b.gambar && (typeof b.gambar !== 'string' || b.gambar.length > 60000)) {
    return 'Gambar terlalu besar — gunakan gambar yang dikompres (±480px) atau URL gambar';
  }
  if (b.tipe === 'PG') {
    if (!Array.isArray(b.opsi) || b.opsi.length < 2) return 'Pilihan ganda minimal 2 opsi';
    if (!b.kunci) return 'Tentukan kunci jawaban PG';
  }
  if (b.tipe === 'BS' && !['BENAR', 'SALAH'].includes(b.kunci)) return 'Kunci BS harus BENAR/SALAH';
  if (b.tipe === 'MENJODOKAN') {
    if (!Array.isArray(b.kiri) || b.kiri.length < 2) return 'Menjodohkan minimal 2 pasangan';
    if (!Array.isArray(b.kanan) || b.kanan.length < 2) return 'Pilihan kanan minimal 2';
  }
  return null;
}

export async function POST(req) {
  const { store, user } = await ctx(req);
  const gate = requireUser(user, ['guru', 'admin']);
  if (gate) return gate;
  const b = await req.json().catch(() => ({}));
  const err = validasi(b);
  if (err) return bad(err);
  const doc = {
    id: id('so'),
    guruId: user.id,
    kisiId: b.kisiId || '',
    kisiItemId: b.kisiItemId || '',
    tipe: b.tipe,
    pertanyaan: b.pertanyaan,
    gambar: b.gambar || null,
    opsi: b.opsi || null,
    kiri: b.kiri || null,
    kanan: b.kanan || null,
    kunci: b.kunci ?? null,
    kunciPoin: b.kunciPoin || '',
    skor: Number(b.skor) || 10,
    level: b.level || 'L1',
    createdAt: new Date().toISOString(),
  };
  await store.insert('soal', doc);
  return ok({ soal: doc });
}

export async function PUT(req) {
  const { store, user } = await ctx(req);
  const gate = requireUser(user, ['guru', 'admin']);
  if (gate) return gate;
  const { searchParams } = new URL(req.url);
  const sid = searchParams.get('id');
  const lama = await store.get('soal', sid);
  if (!lama) return bad('Soal tidak ditemukan', 404);
  if (lama.guruId !== user.id && user.role !== 'admin') return bad('Akses ditolak', 403);
  const b = await req.json().catch(() => ({}));
  const doc = await store.update('soal', sid, {
    kisiId: b.kisiId ?? lama.kisiId,
    kisiItemId: b.kisiItemId ?? lama.kisiItemId,
    tipe: b.tipe ?? lama.tipe,
    pertanyaan: b.pertanyaan ?? lama.pertanyaan,
    gambar: b.gambar !== undefined ? b.gambar : lama.gambar,
    opsi: b.opsi !== undefined ? b.opsi : lama.opsi,
    kiri: b.kiri !== undefined ? b.kiri : lama.kiri,
    kanan: b.kanan !== undefined ? b.kanan : lama.kanan,
    kunci: b.kunci !== undefined ? b.kunci : lama.kunci,
    kunciPoin: b.kunciPoin !== undefined ? b.kunciPoin : lama.kunciPoin,
    skor: b.skor !== undefined ? Number(b.skor) : lama.skor,
    level: b.level ?? lama.level,
  });
  return ok({ soal: doc });
}

export async function DELETE(req) {
  const { store, user } = await ctx(req);
  const gate = requireUser(user, ['guru', 'admin']);
  if (gate) return gate;
  const { searchParams } = new URL(req.url);
  const sid = searchParams.get('id');
  // Lepaskan dari asesmen yang memakai soal ini
  for (const a of await store.list('asesmen')) {
    if ((a.soalIds || []).includes(sid)) {
      await store.update('asesmen', a.id, { soalIds: a.soalIds.filter((x) => x !== sid) });
    }
  }
  await store.remove('soal', sid);
  return ok({ done: true });
}
