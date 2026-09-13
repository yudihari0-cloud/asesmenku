import { ctx, ok, bad, requireUser } from '@/lib/api';
import { id, token as buatToken } from '@/lib/ids';
import { composeSoal } from '@/lib/asesmen';

export async function GET(req) {
  const { store, user } = await ctx(req);
  const gate = requireUser(user);
  if (gate) return gate;
  const semua = (await store.list('asesmen')).filter((a) => a.guruId === user.id || user.role === 'admin');
  const kisiList = await store.list('kisi');
  const attempts = await store.list('attempt');
  return ok({
    asesmen: semua
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      .map((a) => {
        const at = attempts.filter((x) => x.asesmenId === a.id && x.status !== 'berlangsung');
        const skor = at.map((x) => x.skorAkhir ?? x.skorObjektif).filter((s) => s != null);
        return {
          id: a.id,
          judul: a.judul,
          kisiId: a.kisiId,
          kisiJudul: kisiList.find((k) => k.id === a.kisiId)?.judul || '-',
          token: a.token,
          status: a.status,
          durasiMenit: a.durasiMenit,
          kktp: a.kktp,
          jumlahSoal: (a.soalIds || []).length,
          kelasIds: a.kelasIds,
          buka: a.buka,
          tutup: a.tutup,
          createdAt: a.createdAt,
          jumlahPeserta: at.length,
          rataSkor: skor.length ? Math.round((skor.reduce((x, y) => x + y, 0) / skor.length) * 10) / 10 : null,
        };
      }),
  });
}

export async function POST(req) {
  const { store, user } = await ctx(req);
  const gate = requireUser(user, ['guru', 'admin']);
  if (gate) return gate;
  const b = await req.json().catch(() => ({}));
  if (!b.judul) return bad('Judul asesmen wajib diisi');
  const kisi = await store.get('kisi', b.kisiId);
  if (!kisi) return bad('Pilih kisi-kisi terlebih dahulu');

  const bank = (await store.list('soal')).filter((s) => s.kisiId === kisi.id);
  const soalIds = composeSoal(kisi, bank, true);

  const doc = {
    id: id('as'),
    guruId: user.id,
    judul: b.judul,
    kisiId: kisi.id,
    kelasIds: b.kelasIds || [],
    token: (b.token || buatToken()).toUpperCase(),
    durasiMenit: Number(b.durasiMenit) || 60,
    buka: b.buka || '',
    tutup: b.tutup || '',
    acakSoal: b.acakSoal !== false,
    acakOpsi: !!b.acakOpsi,
    tampilkanHasil: b.tampilkanHasil !== false,
    anonimLeaderboard: !!b.anonimLeaderboard,
    kktp: Number(b.kktp) || 75,
    refleksiQs: b.refleksiQs?.length
      ? b.refleksiQs
      : [
          'Bagian mana yang paling sulit untukmu? Mengapa?',
          'Bagaimana perasaanmu setelah mengerjakan asesmen ini?',
          'Apa yang akan kamu lakukan agar lebih memahami materi ini?',
        ],
    soalIds,
    status: 'draft',
    createdAt: new Date().toISOString(),
  };
  await store.insert('asesmen', doc);
  return ok({ asesmen: doc });
}
