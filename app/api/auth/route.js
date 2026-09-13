import { NextResponse } from 'next/server';
import { ctx, ok, bad, safeUser } from '@/lib/api';
import { hashPw, signSession, COOKIE_NAME } from '@/lib/auth';

export async function GET(req) {
  const { user } = await ctx(req);
  return ok({ user: safeUser(user) });
}

export async function POST(req) {
  const { store } = await ctx(req);
  const b = await req.json().catch(() => ({}));

  if (b.action === 'logout') {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 });
    return res;
  }

  const { username, password } = b;
  if (!username || !password) return bad('Isi username/NISN dan password');
  const users = await store.list('users');
  const u = users.find(
    (x) => (x.username === username || x.nisn === username) && x.pwHash === hashPw(password)
  );
  if (!u) return bad('Username/NISN atau password salah', 401);

  const res = NextResponse.json({ user: safeUser(u), role: u.role });
  res.cookies.set(COOKIE_NAME, signSession({ uid: u.id, role: u.role }), {
    httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 14,
  });
  return res;
}
