'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/lib/client';

const MENU = {
  guru: [
    ['sep', 'Menu Guru'],
    ['/guru', '🏠', 'Dashboard'],
    ['/guru/kelas', '👥', 'Kelas & Siswa'],
    ['/guru/kisi', '📋', 'Kisi-Kisi Maker'],
    ['/guru/soal', '🗃️', 'Bank Soal'],
    ['/guru/asesmen', '🚀', 'Asesmen & Hasil'],
    ['/guru/profil', '👤', 'Profil & Sekolah'],
  ],
  siswa: [
    ['sep', 'Menu Siswa'],
    ['/siswa', '📝', 'Asesmen Saya'],
  ],
};

export default function SideNav({ role, nama, inisial, foto, logo, sekolahNama, admin }) {
  const path = usePathname();
  const router = useRouter();

  async function logout() {
    await api('/api/auth', { method: 'POST', body: { action: 'logout' } }).catch(() => {});
    router.push('/login');
  }

  const menu = [...(MENU[role] || [])];
  if (role === 'guru' && admin) menu.push(['/guru/admin', '🔑', 'Panel Aktivasi']);

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="row" style={{ gap: 9, flexWrap: 'nowrap' }}>
          {logo ? (
            <img src={logo} alt="logo sekolah" style={{ width: 30, height: 30, borderRadius: 8, objectFit: 'cover', background: '#fff', padding: 1 }} />
          ) : null}
          <div>
            <div className="logo">Asesmen<span>Ku</span></div>
            <div className="tag">{sekolahNama || 'CP 046 · Kurikulum Merdeka'}</div>
          </div>
        </div>
      </div>
      <nav className="nav">
        {menu.map(([href, icon, label], i) =>
          href === 'sep' ? (
            <div key={'s' + i} className="sep">{icon}</div>
          ) : (
            <Link key={href} href={href} className={path === href || (href !== '/guru' && href !== '/siswa' && path.startsWith(href)) ? 'active' : ''}>
              <span>{icon}</span> {label}
            </Link>
          )
        )}
        <div style={{ flex: 1 }} />
        <button className="btn ghost sm" style={{ color: '#c7d2fe', margin: '0 6px' }} onClick={logout}>⏏ Keluar</button>
      </nav>
      <div className="sidefoot">
        <div className="row" style={{ gap: 8, flexWrap: 'nowrap' }}>
          {foto ? (
            <img src={foto} alt="foto" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <span className="avatar" style={{ background: 'rgba(255,255,255,.15)', color: '#fff' }}>{inisial}</span>
          )}
          <div style={{ minWidth: 0 }}>
            <b style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nama}</b>
            <div>{role === 'guru' ? 'Akun Guru' : 'Akun Siswa'}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
