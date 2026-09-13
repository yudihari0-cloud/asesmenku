import crypto from 'crypto';

const SECRET = process.env.SESSION_SECRET || 'asesmenku-dev-secret';

export function hashPw(pw, salt = 'asesmenku') {
  return crypto.createHash('sha256').update(salt + ':' + pw).digest('hex');
}

export function signSession(obj) {
  const body = Buffer.from(JSON.stringify(obj)).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  return body + '.' + sig;
}

export function verifySession(str) {
  if (!str || typeof str !== 'string') return null;
  const [body, sig] = str.split('.');
  if (!body || !sig) return null;
  const expect = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  if (sig.length !== expect.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect))) return null;
  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString());
  } catch {
    return null;
  }
}

export const COOKIE_NAME = 'asmt_session';

export function setSessionCookie(res, session) {
  res.cookies.set(COOKIE_NAME, signSession(session), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 14,
  });
}

export function clearSessionCookie(res) {
  res.cookies.set(COOKIE_NAME, '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 });
}
