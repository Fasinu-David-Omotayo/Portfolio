import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkRateLimit } from '@/lib/rateLimit';
import { isSameOrigin } from '@/lib/csrf';

export const dynamic = 'force-dynamic'; // ensures Vercel always routes every HTTP method to this function

export async function POST(request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  const ip = request.headers.get('x-forwarded-for') || 'unknown';

  if (!checkRateLimit(`contact:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Too many messages sent. Please try again later.' },
      { status: 429 }
    );
  }

  const { name, email, projectType, message } = await request.json();

  if (!name || !email || !projectType || !message) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }
  if (message.length > 5000) {
    return NextResponse.json({ error: 'Message is too long.' }, { status: 400 });
  }

  await prisma.contactMessage.create({
    data: {
      name: name.slice(0, 200),
      email: email.slice(0, 200),
      projectType: String(projectType).slice(0, 100),
      message,
    },
  });

  await prisma.activity.create({
    data: {
      type: 'message',
      message: `New contact message from ${name}`,
      meta: JSON.stringify({ email }),
    },
  });

  return NextResponse.json({ success: true });
}
