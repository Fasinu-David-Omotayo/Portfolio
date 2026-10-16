import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword } from '@/lib/password';
import { createSessionToken } from '@/lib/jwt';
import { checkRateLimit } from '@/lib/rateLimit';
import { isSameOrigin } from '@/lib/csrf';

export const dynamic = 'force-dynamic'; // ensures Vercel always routes every HTTP method to this function

export async function POST(request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  const ip = request.headers.get('x-forwarded-for') || 'unknown';

  if (!checkRateLimit(`login:${ip}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Too many login attempts. Try again in 15 minutes.' },
      { status: 429 }
    );
  }

  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

  // Deliberately identical error for "no user" and "wrong password" -
  // never reveal which one failed, that leaks which emails have accounts.
  if (!user || !(await verifyPassword(password, user.password))) {
    return NextResponse.json({ error: 'Incorrect email or password.' }, { status: 401 });
  }

  const token = await createSessionToken({ userId: user.id, email: user.email });

  await prisma.activity.create({
    data: { type: 'login', message: 'Admin logged in' },
  });

  const response = NextResponse.json({ success: true });
  response.cookies.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}
