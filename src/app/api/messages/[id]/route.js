import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import { isSameOrigin } from '@/lib/csrf';

export const dynamic = 'force-dynamic';

export async function PATCH(request, { params }) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = parseInt(params.id, 10);
  const { read } = await request.json();

  const message = await prisma.contactMessage.update({
    where: { id },
    data: { read: Boolean(read) },
  });

  return NextResponse.json(message);
}

export async function DELETE(request, { params }) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = parseInt(params.id, 10);
  const message = await prisma.contactMessage.delete({ where: { id } }).catch(() => null);

  if (message) {
    await prisma.activity.create({
      data: { type: 'delete', message: `Admin deleted a message from ${message.name}` },
    });
  }

  return NextResponse.json({ success: true });
}
