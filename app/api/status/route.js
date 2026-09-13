import { getStore, boot } from '@/lib/store';
import { ctx, ok, requireUser } from '@/lib/api';

/** GET — status sistem (mode penyimpanan & jumlah data) untuk dashboard */
export async function GET(req) {
  await boot();
  const { user } = await ctx(req);
  const gate = requireUser(user);
  if (gate) return gate;

  const store = getStore();
  const jumlah = {};
  for (const col of ['users', 'kelas', 'cp', 'kisi', 'soal', 'asesmen', 'attempt', 'refleksi']) {
    try {
      jumlah[col] = (await store.list(col)).length;
    } catch {
      jumlah[col] = 0;
    }
  }
  return ok({
    store: store.name,
    storeLabel:
      store.name === 'sheets' ? 'Google Sheets terhubung ✓' : 'JSON lokal (mode demo)',
    jumlah,
  });
}
