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

  const imageId = parseInt(params.imageId, 10);
  if (!Number.isInteger(imageId)) {
    return NextResponse.json({ error: 'Invalid image id.' }, { status: 400 });
  }

  await prisma.workImage.deleteMany({ where: { id: imageId, workId: parseInt(params.id, 10) } });

  revalidatePath('/');

  return NextResponse.json({ ok: true });
}
