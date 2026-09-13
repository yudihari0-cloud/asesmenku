import { NextResponse } from 'next/server';
import { getStore, boot } from '@/lib/store';
import { ctx, ok, requireUser } from '@/lib/api';

/** Email service account yang dipakai app (untuk verifikasi share spreadsheet) */
function saEmail() {
  try {
    const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!raw) return '(env GOOGLE_SERVICE_ACCOUNT_JSON kosong)';
    const s = raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
    const j = JSON.parse(s);
    return j.client_email || '(client_email tidak ditemukan di JSON)';
  } catch (e) {
    return '(JSON tidak bisa dibaca: ' + String(e?.message || e) + ')';
  }
}

/** GET — status sistem. Jika koneksi Google Sheets gagal, pesan error asli
 *  dikembalikan supaya mudah didiagnosis langsung dari browser. */
export async function GET(req) {
  let bootError = null;
  try {
    await boot();
  } catch (e) {
    bootError = String(e?.message || e);
  }

  if (bootError) {
    return NextResponse.json({
      ok: false,
      serviceAccount: saEmail(),
      error: bootError,
      hint: 'Pastikan email pada "serviceAccount" di-share ke spreadsheet sebagai Editor, dan GOOGLE_SHEETS_ID benar.',
    });
  }

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
    ok: true,
    store: store.name,
    storeLabel:
      store.name === 'sheets' ? 'Google Sheets terhubung ✓' : 'JSON lokal (mode demo)',
    jumlah,
  });
}
