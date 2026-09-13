import { ctx, ok, bad, requireUser, safeUser } from '@/lib/api';

/** GET — profil user yang login */
export async function GET(req) {
  const { user } = await ctx(req);
  const gate = requireUser(user);
  if (gate) return gate;
  return ok({ profil: safeUser(user) });
}

/** PUT — perbarui profil guru (nama, NIP, jabatan, WA, foto) */
export async function PUT(req) {
  const { store, user } = await ctx(req);
  const gate = requireUser(user, ['guru', 'admin']);
  if (gate) return gate;
  const b = await req.json().catch(() => ({}));
  const patch = {};
  if (b.nama !== undefined) patch.nama = String(b.nama).trim().slice(0, 120);
  if (b.nip !== undefined) patch.nip = String(b.nip).trim().slice(0, 30);
  if (b.jabatan !== undefined) patch.jabatan = String(b.jabatan).trim().slice(0, 80);
  if (b.wa !== undefined) {
    let wa = String(b.wa).replace(/\D/g, '');
    if (wa.startsWith('0')) wa = '62' + wa.slice(1);
    else if (wa.startsWith('8')) wa = '62' + wa;
    patch.wa = wa.length >= 9 ? wa : '';
  }
  if (b.foto !== undefined) {
    if (b.foto && (typeof b.foto !== 'string' || b.foto.length > 90000)) {
      return bad('Foto terlalu besar — gunakan gambar yang lebih kecil');
    }
    patch.foto = b.foto || '';
  }
  const baru = await store.update('users', user.id, patch);
  return ok({ profil: safeUser(baru) });
}
