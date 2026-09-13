import QRCode from 'qrcode';

/** GET /api/qr?text=...&size=180 — QR code SVG (untuk share link asesmen & kartu ujian) */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get('text') || '';
  const size = Math.min(600, Math.max(80, Number(searchParams.get('size')) || 180));
  if (!text) return new Response('Parameter text wajib', { status: 400 });
  const svg = await QRCode.toString(text, {
    type: 'svg',
    width: size,
    margin: 1,
    color: { dark: '#312e81', light: '#ffffff' },
  });
  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' },
  });
}
