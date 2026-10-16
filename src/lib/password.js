import bcrypt from 'bcryptjs';

// This file uses Node APIs (via bcryptjs) and must never be imported from
// src/middleware.js or anything else that runs on the Edge runtime.

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
