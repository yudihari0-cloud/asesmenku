import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifySession, COOKIE_NAME } from '@/lib/auth';

/**
 * Landing page publik — profil produk, harga (sekali bayar), dan pintu masuk:
 * Masuk · Coba Demo · Daftar dengan Kode Aktivasi.
 * Pengunjung yang sudah login langsung diarahkan ke aplikasi.
 */
export default async function Home() {
  const session = verifySession((await cookies()).get(COOKIE_NAME)?.value);
  if (session) {
    const { getStore, boot } = await import('@/lib/store');
    await boot();
    const user = await getStore().get('users', session.uid);
    if (user) redirect(user.role === 'siswa' ? '/siswa' : '/guru');
  }

  const fitur = [
    ['📋', 'Kisi-Kisi Maker', 'Susun kisi-kisi dari CP resmi BSKAP 046 — lengkap Fase A–F (SD kelas 1 s.d. SMA kelas 12), semua mapel.'],
    ['🗃️', 'Bank Soal', '4 bentuk soal: Pilihan Ganda, Benar/Salah, Menjodohkan, dan Essay. Gambar soal didukung.'],
    ['🚀', 'Asesmen Online', 'Token & QR Code, acak soal/opsi, jadwal buka-tutup, siswa mengerjakan dari HP tanpa install apa pun.'],
    ['✍️', 'Koreksi & Analisis', 'Nilai essay dengan rubrik, analisis butir (tingkat kesukaran & daya beda), penguasaan indikator → CP.'],
    ['📊', 'Rapor & Leaderboard', 'Rapor mini per siswa, rekap kelas, leaderboard bermedali, halaman hasil publik untuk wali murid.'],
    ['🖨️', 'Bagikan & Cetak', 'Share WhatsApp, QR poster, kartu ujian, export Excel — semua siap cetak.'],
  ];

  return (
    <div style={{ fontFamily: 'inherit', color: '#1e293b', background: '#f8fafc', minHeight: '100vh' }}>
      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #9333ea 100%)', color: '#fff', padding: '72px 20px 88px', textAlign: 'center' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.5px' }}>
            Asesmen<span style={{ color: '#c4b5fd' }}>Ku</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', lineHeight: 1.15, marginTop: 22, fontWeight: 800 }}>
            Buat Asesmen Berbasis CP<br />dalam Hitungan Menit
          </h1>
          <p style={{ marginTop: 18, fontSize: 17, color: '#e0e7ff', lineHeight: 1.6 }}>
            Dari kisi-kisi sampai rapor — satu aplikasi untuk guru SD, SMP, dan SMA.<br />
            Siswa mengerjakan dari HP lewat token/QR. <b>Tanpa install, tanpa ribet.</b>
          </p>
          <div style={{ marginTop: 34, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" style={{ background: '#fff', color: '#4f46e5', padding: '13px 28px', borderRadius: 12, fontWeight: 700, textDecoration: 'none', boxShadow: '0 8px 24px rgba(0,0,0,.18)' }}>
              🔑 Coba Demo Gratis
            </Link>
            <Link href="/daftar" style={{ background: 'rgba(255,255,255,.14)', border: '1.5px solid rgba(255,255,255,.65)', color: '#fff', padding: '13px 28px', borderRadius: 12, fontWeight: 700, textDecoration: 'none' }}>
              🎓 Daftar dengan Kode Aktivasi
            </Link>
            <Link href="/aktifasi" style={{ background: 'transparent', border: '1.5px solid rgba(255,255,255,.4)', color: '#e0e7ff', padding: '13px 28px', borderRadius: 12, fontWeight: 600, textDecoration: 'none' }}>
              Perpanjang Masa Aktif
            </Link>
          </div>
          <div style={{ marginTop: 20, fontSize: 13, color: '#c7d2fe' }}>
            Akun demo: <b>guru</b> yudi / guru123 · <b>siswa</b> uji token <b>MTK800</b>
          </div>
        </div>
      </div>

      {/* FITUR */}
      <div style={{ maxWidth: 1080, margin: '-44px auto 0', padding: '0 20px', position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {fitur.map(([ikon, judul, teks]) => (
            <div key={judul} style={{ background: '#fff', borderRadius: 16, padding: '22px 22px 20px', boxShadow: '0 10px 30px rgba(30,27,75,.10)', border: '1px solid #eef2f7' }}>
              <div style={{ fontSize: 30 }}>{ikon}</div>
              <h3 style={{ margin: '10px 0 6px', fontSize: 17 }}>{judul}</h3>
              <p style={{ margin: 0, fontSize: 14, color: '#64748b', lineHeight: 1.55 }}>{teks}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ALUR */}
      <div style={{ maxWidth: 900, margin: '64px auto 0', padding: '0 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 26 }}>Semudah 1 · 2 · 3</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginTop: 24 }}>
          {[
            ['1', 'Daftar dengan kode aktivasi', 'Beli kode, daftarkan sekolah, akun guru langsung aktif 1 tahun.'],
            ['2', 'Import siswa & buat asesmen', 'Import siswa dari Excel, susun kisi-kisi + soal, publikasikan dengan token.'],
            ['3', 'Siswa mengerjakan, hasil otomatis', 'Nilai, analisis, rapor, dan leaderboard tersaji tanpa kerja manual.'],
          ].map(([n, judul, teks]) => (
            <div key={n} style={{ background: '#fff', borderRadius: 16, padding: 22, border: '1px solid #eef2f7' }}>
              <div style={{ width: 42, height: 42, margin: '0 auto', borderRadius: '50%', background: '#4f46e5', color: '#fff', fontWeight: 800, fontSize: 19, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n}</div>
              <h3 style={{ margin: '12px 0 6px', fontSize: 15.5 }}>{judul}</h3>
              <p style={{ margin: 0, fontSize: 13.5, color: '#64748b', lineHeight: 1.55 }}>{teks}</p>
            </div>
          ))}
        </div>
      </div>

      {/* HARGA */}
      <div style={{ maxWidth: 640, margin: '64px auto', padding: '0 20px' }}>
        <div style={{ background: 'linear-gradient(135deg, #312e81, #4f46e5)', color: '#fff', borderRadius: 20, padding: '36px 30px', textAlign: 'center', boxShadow: '0 16px 40px rgba(49,46,129,.35)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.4, color: '#c4b5fd' }}>SEKALI BAYAR</div>
          <h2 style={{ fontSize: 30, margin: '10px 0 4px' }}>Aktif 1 Tahun Penuh</h2>
          <p style={{ color: '#e0e7ff', fontSize: 14.5, lineHeight: 1.6 }}>
            Satu kode aktivasi untuk satu sekolah — <b>semua guru & siswa</b>.<br />
            Tanpa langganan, tanpa biaya bulanan, tanpa iklan.
          </p>
          <div style={{ margin: '22px 0', padding: '14px 0', borderTop: '1px solid rgba(255,255,255,.18)', borderBottom: '1px solid rgba(255,255,255,.18)', display: 'flex', justifyContent: 'center', gap: 26, flexWrap: 'wrap', fontSize: 13.5 }}>
            <span>✔ Master CP lengkap A–F</span>
            <span>✔ Siswa tanpa batas</span>
            <span>✔ Data di Google Sheets milik sendiri</span>
          </div>
          <Link href="https://wa.me/?text=Halo%2C%20saya%20tertarik%20beli%20kode%20aktivasi%20AsesmenKu" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: '#22c55e', color: '#fff', padding: '13px 30px', borderRadius: 12, fontWeight: 700, textDecoration: 'none' }}>
            💬 Beli Kode Aktivasi via WhatsApp
          </Link>
          <div style={{ marginTop: 12, fontSize: 12.5, color: '#c7d2fe' }}>Kode dikirim setelah konfirmasi pembayaran.</div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: '1px solid #e2e8f0', padding: '26px 20px 40px', textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>
        <b style={{ color: '#4f46e5' }}>AsesmenKu</b> · Asesmen berbasis CP BSKAP 046/H/KR/2025 · Dibuat untuk guru Indonesia 🇮🇩
        <div style={{ marginTop: 8 }}>
          <Link href="/login" style={{ color: '#4f46e5', textDecoration: 'none' }}>Masuk</Link>
          {' · '}
          <Link href="/daftar" style={{ color: '#4f46e5', textDecoration: 'none' }}>Daftar</Link>
          {' · '}
          <Link href="/aktifasi" style={{ color: '#4f46e5', textDecoration: 'none' }}>Aktivasi / Perpanjang</Link>
        </div>
      </div>
    </div>
  );
}
