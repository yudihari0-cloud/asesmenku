import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifySession, COOKIE_NAME } from '@/lib/auth';
import { getStore, boot } from '@/lib/store';
import SideNav from '@/components/SideNav';

export default async function GuruLayout({ children }) {
  const session = verifySession((await cookies()).get(COOKIE_NAME)?.value);
  if (!session) redirect('/login');
  await boot();
  const user = await getStore().get('users', session.uid);
  if (!user) redirect('/login');
  if (user.role === 'siswa') redirect('/siswa');

  const inisial = (user.nama || 'G').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const sekolah = (await getStore().list('sekolah')).find((s) => s.id === (user.sekolahId || 'demo')) || null;
  return (
    <div className="shell">
      <SideNav
        role="guru"
        nama={user.nama}
        inisial={inisial}
        foto={user.foto || ''}
        logo={sekolah?.logo || ''}
        sekolahNama={sekolah?.nama || user.namaSekolah || ''}
      />
      <div className="main">{children}</div>
    </div>
  );
}
