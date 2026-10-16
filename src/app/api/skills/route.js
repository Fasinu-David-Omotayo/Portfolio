import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import { isSameOrigin } from '@/lib/csrf';

export const dynamic = 'force-dynamic';

// Public - powers the Skills section on the live site.
export async function GET() {
  const skills = await prisma.skill.findMany({ orderBy: [{ category: 'asc' }, { order: 'asc' }] });
  return NextResponse.json(skills);
}

// Protected - admin adds a new skill under a category.
export async function POST(request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { category, name } = await request.json();

  if (!category || !name) {
    return NextResponse.json({ error: 'Category and name are required.' }, { status: 400 });
  }
  if (category.length > 60 || name.length > 60) {
    return NextResponse.json({ error: 'Keep category and name under 60 characters.' }, { status: 400 });
  }

  const lastInCategory = await prisma.skill.findFirst({
    where: { category: category.trim() },
    orderBy: { order: 'desc' },
  });

  const skill = await prisma.skill.create({
    data: {
      category: category.trim(),
      name: name.trim(),
      order: lastInCategory ? lastInCategory.order + 1 : 0,
    },
  });

  revalidatePath('/');

  return NextResponse.json(skill);
}
