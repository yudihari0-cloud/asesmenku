import { ctx, ok, bad, requireUser } from '@/lib/api';
import { id } from '@/lib/ids';
import { kisiXlsx } from '@/lib/excel';

export async function GET(req) {
  const { store, user } = await ctx(req);
  const gate = requireUser(user);
  if (gate) return gate;
  const { searchParams } = new URL(req.url);
  const kid = searchParams.get('id');

  if (kid && searchParams.get('export')) {
    const kisi = await store.get('kisi', kid);
    if (!kisi) return bad('Kisi-kisi tidak ditemukan', 404);
    if (kisi.guruId !== user.id && user.role !== 'admin') return bad('Akses ditolak', 403);
    const sekolah = (await store.list('sekolah')).find((s) => s.id === (user.sekolahId || 'demo')) || null;
    return kisiXlsx(kisi, {
      sekolah: sekolah?.nama || user.namaSekolah || '',
      guru: user.nama,
      nip: user.nip || '',
    });
  }
  if (kid) {
    const k = await store.get('kisi', kid);
    if (k && k.guruId !== user.id && user.role !== 'admin') return bad('Akses ditolak', 403);
    return ok({ kisi: k });
  }

  const semua = await store.list('kisi');
  const milik = semua.filter((k) => k.guruId === user.id || user.role === 'admin');
  const soal = await store.list('soal');
  const asesmen = await store.list('asesmen');
  return ok({
    kisi: milik
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      .map((k) => ({
        ...k,
        jumlahSoalBank: soal.filter((s) => s.kisiId === k.id).length,
        dipakaiOleh: asesmen.filter((a) => a.kisiId === k.id).length,
      })),
  });
}

function bersihkanItems(items) {
  return (items || []).map((it) => ({
    id: it.id || id('it'),
    elemen: it.elemen || '',
    cpId: it.cpId || '',
    cpTeks: it.cpTeks || '',
    materi: it.materi || '',
    indikator: it.indikator || '',
    level: it.level || 'L1',
    bentuk: it.bentuk || 'PG',
    jumlah: Number(it.jumlah) || 0,
    bobot: Number(it.bobot) || 0,
  }));
}

export async function POST(req) {
  const { store, user } = await ctx(req);
  const gate = requireUser(user, ['guru', 'admin']);
  if (gate) return gate;
  const b = await req.json().catch(() => ({}));
  if (!b.judul) return bad('Judul kisi-kisi wajib diisi');
  const kisi = {
    id: id('kk'),
    guruId: user.id,
    judul: b.judul,
    mapel: b.mapel || '',
    fase: b.fase || 'D',
    kelas: b.kelas || '',
    tp: b.tp || '',
    items: bersihkanItems(b.items),
    createdAt: new Date().toISOString(),
  };
  await store.insert('kisi', kisi);
  return ok({ kisi });
}

export async function PUT(req) {
  const { store, user } = await ctx(req);
  const gate = requireUser(user, ['guru', 'admin']);
  if (gate) return gate;
  const { searchParams } = new URL(req.url);
  const kid = searchParams.get('id');
  const lama = await store.get('kisi', kid);
  if (!lama) return bad('Kisi-kisi tidak ditemukan', 404);
  if (lama.guruId !== user.id && user.role !== 'admin') return bad('Akses ditolak', 403);
  const b = await req.json().catch(() => ({}));
  const kisi = await store.update('kisi', kid, {
    judul: b.judul ?? lama.judul,
    mapel: b.mapel ?? lama.mapel,
    fase: b.fase ?? lama.fase,
    kelas: b.kelas ?? lama.kelas,
    tp: b.tp ?? lama.tp,
    items: b.items ? bersihkanItems(b.items) : lama.items,
  });
  return ok({ kisi });
}

export async function DELETE(req) {
  const { store, user } = await ctx(req);
  const gate = requireUser(user, ['guru', 'admin']);
  if (gate) return gate;
  const { searchParams } = new URL(req.url);
  const kid = searchParams.get('id');
  const dipakai = (await store.list('asesmen')).some((a) => a.kisiId === kid);
  if (dipakai && !searchParams.get('force')) return bad('Kisi-kisi sedang dipakai asesmen. Hapus asesmen dulu atau pakai ?force=1');
  await store.remove('kisi', kid);
  return ok({ done: true });
}
