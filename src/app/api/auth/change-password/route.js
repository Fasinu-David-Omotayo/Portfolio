import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import { hashPassword, verifyPassword } from '@/lib/password';
import { isSameOrigin } from '@/lib/csrf';
import { checkRateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic'; // ensures Vercel always routes every HTTP method to this function

export async function POST(request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!checkRateLimit(`change-password:${session.userId}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });
  }

  const { currentPassword, newPassword } = await request.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Both current and new password are required.' }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || !(await verifyPassword(currentPassword, user.password))) {
    return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 });
  }

  const hashed = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

  await prisma.activity.create({
    data: { type: 'edit', message: 'Admin changed their password' },
  });

  return NextResponse.json({ success: true });
}
