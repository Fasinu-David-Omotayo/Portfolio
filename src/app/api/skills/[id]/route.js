import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import { isSameOrigin } from '@/lib/csrf';

export const dynamic = 'force-dynamic';

export async function DELETE(request, { params }) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = parseInt(params.id, 10);
  await prisma.skill.delete({ where: { id } }).catch(() => null);

  revalidatePath('/');

  return NextResponse.json({ success: true });
}
