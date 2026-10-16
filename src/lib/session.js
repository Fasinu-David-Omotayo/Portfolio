import { cookies } from 'next/headers';
import { verifySessionToken } from './jwt';

export async function getSession() {
  const token = cookies().get('session')?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
