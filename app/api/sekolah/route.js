import { ctx, ok, bad, requireUser } from '@/lib/api';

/** GET — data sekolah milik user yang login */
export async function GET(req) {
  const { store, user } = await ctx(req);
  const gate = requireUser(user);
  if (gate) return gate;
  const sekolah = (await store.list('sekolah')).find((s) => s.id === (user.sekolahId || 'demo'));
  return ok({
    sekolah: sekolah || { id: user.sekolahId || 'demo', nama: user.namaSekolah || '', alamat: '', logo: '' },
  });
}

/** PUT — perbarui nama/alamat/logo sekolah (guru/admin) */
export async function PUT(req) {
  const { store, user } = await ctx(req);
  const gate = requireUser(user, ['guru', 'admin']);
  if (gate) return gate;
  const b = await req.json().catch(() => ({}));
  const patch = {};
  if (b.nama !== undefined) patch.nama = String(b.nama).trim().slice(0, 120);
  if (b.alamat !== undefined) patch.alamat = String(b.alamat).trim().slice(0, 200);
  if (b.logo !== undefined) {
    if (b.logo && (typeof b.logo !== 'string' || b.logo.length > 90000)) {
      return bad('Logo terlalu besar — gunakan gambar yang lebih kecil');
    }
    patch.logo = b.logo || '';
  }
  const idv = user.sekolahId || 'demo';
  const lama = (await store.list('sekolah')).find((s) => s.id === idv);
  if (lama) await store.update('sekolah', idv, patch);
  else await store.insert('sekolah', { id: idv, nama: '', alamat: '', logo: '', createdAt: new Date().toISOString(), ...patch });
  return ok({ done: true });
}
