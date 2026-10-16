import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import { isSameOrigin } from '@/lib/csrf';

export const dynamic = 'force-dynamic';

const MAX_NAME = 80;
const MAX_ROLE = 120;
const MAX_QUOTE = 600;

// Public - powers the Testimonials section on the live site.
export async function GET() {
  const testimonials = await prisma.testimonial.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json(testimonials);
}

// Protected - admin adds a new testimonial.
export async function POST(request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, role, quote } = await request.json();

  if (!name?.trim() || !role?.trim() || !quote?.trim()) {
    return NextResponse.json({ error: 'Name, role, and quote are required.' }, { status: 400 });
  }
  if (name.length > MAX_NAME || role.length > MAX_ROLE || quote.length > MAX_QUOTE) {
    return NextResponse.json({ error: 'One of those fields is too long.' }, { status: 400 });
  }

  const last = await prisma.testimonial.findFirst({ orderBy: { order: 'desc' } });

  const testimonial = await prisma.testimonial.create({
    data: {
      name: name.trim(),
      role: role.trim(),
      quote: quote.trim(),
      order: last ? last.order + 1 : 0,
    },
  });

  await prisma.activity.create({
    data: { type: 'edit', message: `Admin added a testimonial from ${testimonial.name}` },
  });

  revalidatePath('/');

  return NextResponse.json(testimonial);
}
