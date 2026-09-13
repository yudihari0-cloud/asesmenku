'use client';

/** Helper fetch + util kecil untuk sisi klien */

export async function api(path, opts = {}) {
  const { body, ...rest } = opts;
  const r = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...rest,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || 'Terjadi kesalahan');
  return j;
}

export function fmtDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function copyText(t) {
  try {
    navigator.clipboard?.writeText(t);
  } catch {}
}

/** Link share WhatsApp (dengan atau tanpa nomor tujuan) */
export function waLink(text, phone = '') {
  const t = encodeURIComponent(text);
  return phone ? `https://wa.me/${phone}?text=${t}` : `https://wa.me/?text=${t}`;
}

/** Kompres gambar di sisi browser → data URI JPEG kecil (aman untuk Google Sheets) */
export function fileToDataUri(file, maxDim = 480, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const skala = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * skala);
        canvas.height = Math.round(img.height * skala);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const BENTUK_LABEL = { PG: 'Pilihan Ganda', BS: 'Benar/Salah', MENJODOKAN: 'Menjodohkan', ESSAY: 'Essay' };
export const LEVEL_LABEL = { L1: 'L1 · Memahami', L2: 'L2 · Mengaplikasi', L3: 'L3 · Bermakna' };
