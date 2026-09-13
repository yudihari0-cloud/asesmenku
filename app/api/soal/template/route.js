import { ctx, bad, requireUser } from '@/lib/api';
import { soalTemplateXlsx } from '@/lib/excel';

/** GET /api/soal/template?kisiId=... — unduh template Excel import bank soal */
export async function GET(req) {
  const { store, user } = await ctx(req);
  const gate = requireUser(user, ['guru', 'admin']);
  if (gate) return gate;
  const { searchParams } = new URL(req.url);
  const kisiId = searchParams.get('kisiId');
  const kisi = kisiId ? await store.get('kisi', kisiId) : null;
  if (kisiId && (!kisi || (kisi.guruId !== user.id && user.role !== 'admin'))) {
    return bad('Kisi-kisi tidak ditemukan', 404);
  }
  return soalTemplateXlsx(kisi);
}
