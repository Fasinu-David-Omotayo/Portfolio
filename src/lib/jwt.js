import { SignJWT, jwtVerify } from 'jose';

// jose uses Web Crypto, so this file is safe to import from Edge middleware.
// Keep bcrypt (Node-only) out of this file - see lib/password.js instead.

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-only-secret-please-change-before-deploying-to-production'
);

export async function createSessionToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifySessionToken(token) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}
