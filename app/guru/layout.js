import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifySession, COOKIE_NAME } from '@/lib/auth';
import { getStore, boot } from '@/lib/store';
import SideNav from '@/components/SideNav';

const WA_BELI = 'https://wa.me/?text=' + encodeURIComponent('Halo, saya mau perpanjang masa aktif AsesmenKu. Minta kode aktivasinya ya.');

export default async function GuruLayout({ children }) {
  const session = verifySession((await cookies()).get(COOKIE_NAME)?.value);
  if (!session) redirect('/login');
  await boot();
  const store = getStore();
  const user = await store.get('users', session.uid);
  if (!user) redirect('/login');
  if (user.role === 'siswa') redirect('/siswa');

  const sekolah = (await store.list('sekolah')).find((s) => s.id === (user.sekolahId || 'demo')) || null;

  // Gerbang masa aktif: sekolah kedaluwarsa -> tampilkan halaman aktivasi (kecuali admin)
  const expired = sekolah?.masaAktifSampai && new Date(sekolah.masaAktifSampai).getTime() < Date.now();
  if (expired && !user.admin) {
    return (
      <div className="auth-wrap">
        <div className="auth-hero">
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>Asesmen<span>Ku</span></div>
            <h1 className="mt" style={{ marginTop: 26 }}>Masa aktif<br />sekolah berakhir</h1>
          </div>
          <div className="small" style={{ color: '#a5b4fc' }}>
            Masa aktif <b>{sekolah?.nama || 'sekolah'}</b> berakhir pada{' '}
            {new Date(sekolah.masaAktifSampai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}.
          </div>
        </div>
        <div className="auth-form">
          <div className="auth-card center card-p">
            <div style={{ fontSize: 46 }}>⏳</div>
            <h2>Perpanjang 1 Tahun</h2>
            <p className="muted small">
              Data seluruh sekolahmu <b>aman tersimpan</b>. Masukkan kode aktivasi baru untuk melanjutkan menggunakan AsesmenKu.
            </p>
            <Link className="btn primary" href="/aktifasi">🔓 Masukkan Kode Aktivasi</Link>
            <p className="muted small" style={{ marginTop: 12 }}>
              Belum punya kode?{' '}
              <a href={WA_BELI} target="_blank" rel="noopener noreferrer">Hubungi admin via WhatsApp</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const inisial = (user.nama || 'G').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className="shell">
      <SideNav
        role="guru"
        nama={user.nama}
        inisial={inisial}
        foto={user.foto || ''}
        logo={sekolah?.logo || ''}
        sekolahNama={sekolah?.nama || user.namaSekolah || ''}
        admin={!!user.admin}
      />
      <div className="main">{children}</div>
    </div>
  );
}
