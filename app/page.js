import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifySession, COOKIE_NAME } from '@/lib/auth';
import { getStore, boot } from '@/lib/store';

export default async function Home() {
  const session = verifySession((await cookies()).get(COOKIE_NAME)?.value);
  if (!session) redirect('/login');
  await boot();
  const user = await getStore().get('users', session.uid);
  if (!user) redirect('/login');
  redirect(user.role === 'siswa' ? '/siswa' : '/guru');
}
