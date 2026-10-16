import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import { isSameOrigin } from '@/lib/csrf';

export const dynamic = 'force-dynamic';

const MAX_NAME = 80;
const MAX_ROLE = 120;
const MAX_QUOTE = 600;

// Protected - edit an existing testimonial's text, or its `order` (used
// for simple up/down reordering from the admin list).
export async function PATCH(request, { params }) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = parseInt(params.id, 10);
  const body = await request.json();
  const data = {};

  if (body.name !== undefined) {
    const value = String(body.name).trim();
    if (!value || value.length > MAX_NAME) {
      return NextResponse.json({ error: 'Name is required and must be under 80 characters.' }, { status: 400 });
    }
    data.name = value;
  }
  if (body.role !== undefined) {
    const value = String(body.role).trim();
    if (!value || value.length > MAX_ROLE) {
      return NextResponse.json({ error: 'Role is required and must be under 120 characters.' }, { status: 400 });
    }
    data.role = value;
  }
  if (body.quote !== undefined) {
    const value = String(body.quote).trim();
    if (!value || value.length > MAX_QUOTE) {
      return NextResponse.json({ error: 'Quote is required and must be under 600 characters.' }, { status: 400 });
    }
    data.quote = value;
  }
  if (body.order !== undefined) {
    const num = parseInt(body.order, 10);
    data.order = Number.isFinite(num) ? num : 0;
  }

  const testimonial = await prisma.testimonial.update({ where: { id }, data }).catch(() => null);
  if (!testimonial) return NextResponse.json({ error: 'Testimonial not found.' }, { status: 404 });

  revalidatePath('/');

  return NextResponse.json(testimonial);
}

// Protected - remove a testimonial.
export async function DELETE(request, { params }) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = parseInt(params.id, 10);
  await prisma.testimonial.delete({ where: { id } }).catch(() => null);

  await prisma.activity.create({
    data: { type: 'delete', message: 'Admin removed a testimonial' },
  });

  revalidatePath('/');

  return NextResponse.json({ success: true });
}
