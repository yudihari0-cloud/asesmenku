import { NextResponse } from 'next/server';
import { boot } from './store';
import { verifySession, COOKIE_NAME } from './auth';

/** Konteks request: {store, user} — user null jika belum login */
export async function ctx(req) {
  const store = await boot();
  const session = verifySession(req.cookies.get(COOKIE_NAME)?.value);
  const user = session ? await store.get('users', session.uid) : null;
  return { store, user };
}

export function safeUser(u) {
  if (!u) return null;
  const { pwHash, ...rest } = u;
  return rest;
}

export const ok = (data) => NextResponse.json(data);
export const bad = (error, status = 400) => NextResponse.json({ error }, { status });

/** Pastikan user login & (opsional) punya salah satu role */
export function requireUser(user, roles) {
  if (!user) return bad('Silakan login dulu', 401);
  if (roles && !roles.includes(user.role)) return bad('Akses ditolak untuk role ini', 403);
  return null;
}

export function getOrigin(req) {
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL;
  const o = req.headers.get('origin');
  if (o) return o;
  const h = req.headers.get('host');
  return h ? (h.startsWith('localhost') ? 'http://' + h : 'https://' + h) : 'http://localhost:3000';
}
