import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import { verifyPassword } from '@/lib/password';
import { createSessionToken } from '@/lib/jwt';
import { isSameOrigin } from '@/lib/csrf';
import { checkRateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic'; // ensures Vercel always routes every HTTP method to this function

export async function POST(request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!checkRateLimit(`change-email:${session.userId}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });
  }

  const { currentPassword, newEmail } = await request.json();

  if (!currentPassword || !newEmail) {
    return NextResponse.json({ error: 'Current password and new email are required.' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || !(await verifyPassword(currentPassword, user.password))) {
    return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 });
  }

  const normalizedEmail = newEmail.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing && existing.id !== user.id) {
    return NextResponse.json({ error: 'That email is already in use.' }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { email: normalizedEmail },
  });

  await prisma.activity.create({
    data: { type: 'edit', message: 'Admin changed their login email' },
  });

  // Reissue the session so it reflects the new email immediately.
  const token = await createSessionToken({ userId: updated.id, email: updated.email });
  const response = NextResponse.json({ success: true, email: updated.email });
  response.cookies.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
