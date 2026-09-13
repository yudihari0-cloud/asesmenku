import crypto from 'crypto';

/** ID & token generator — aman untuk Node.js maupun Cloudflare Workers (WebCrypto) */

function acak(n) {
  if (crypto.getRandomValues) {
    const a = new Uint8Array(n);
    crypto.getRandomValues(a);
    return a;
  }
  return crypto.randomBytes(n);
}

const HEX = [...Array(256)].map((_, i) => i.toString(16).padStart(2, '0'));

/** ID unik pendek, mis. "so_1a2b3c4d5e6f" */
export function id(prefix = '') {
  const a = acak(6);
  let s = '';
  for (let i = 0; i < a.length; i++) s += HEX[a[i]];
  return (prefix ? prefix + '_' : '') + s;
}

/** Token untuk link asesmen — tanpa karakter ambigu (0/O, 1/I) */
export function token(len = 6) {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const a = acak(len);
  let s = '';
  for (let i = 0; i < a.length; i++) s += A[a[i] % A.length];
  return s;
}
