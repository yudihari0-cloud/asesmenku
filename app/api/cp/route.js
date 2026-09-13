import { ctx, ok, requireUser } from '@/lib/api';

/** GET — daftar Capaian Pembelajaran (BSKAP 046/H/KR/2025) */
export async function GET(req) {
  const { store, user } = await ctx(req);
  const gate = requireUser(user);
  if (gate) return gate;
  const { searchParams } = new URL(req.url);
  const fase = searchParams.get('fase');
  const mapel = searchParams.get('mapel');
  let cp = await store.list('cp');
  if (fase) cp = cp.filter((c) => c.fase === fase);
  if (mapel) cp = cp.filter((c) => c.mapel === mapel);
  const mapelList = [...new Set((await store.list('cp')).map((c) => c.mapel))];
  return ok({ cp, mapelList });
}
