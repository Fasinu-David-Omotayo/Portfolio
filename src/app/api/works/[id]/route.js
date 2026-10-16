import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import { isSameOrigin } from '@/lib/csrf';
import { isValidImageUrl, isSafeHttpUrl } from '@/lib/validation';
import { CATEGORY_VALUES } from '@/lib/categories';

export const dynamic = 'force-dynamic';

const TYPES = ['dev', 'design', 'data'];

export async function PUT(request, { params }) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = parseInt(params.id, 10);
  const body = await request.json();
  const { title, type, subCategory, description, techStack, liveUrl, githubUrl, status, featured, imageUrl, thumbUrl, blurDataUrl, problem, approach, result } = body;

  if (type !== undefined && !TYPES.includes(type)) {
    return NextResponse.json({ error: 'Invalid work type.' }, { status: 400 });
  }
  if (subCategory !== undefined && subCategory && !CATEGORY_VALUES.includes(subCategory)) {
    return NextResponse.json({ error: 'Invalid design sub-category.' }, { status: 400 });
  }
  if (imageUrl !== undefined && !isValidImageUrl(imageUrl)) {
    return NextResponse.json({ error: 'Image must come from the upload endpoint.' }, { status: 400 });
  }
  if (thumbUrl !== undefined && !isValidImageUrl(thumbUrl)) {
    return NextResponse.json({ error: 'Image must come from the upload endpoint.' }, { status: 400 });
  }
  if (title !== undefined && title.length > 200) {
    return NextResponse.json({ error: 'Title is too long (200 characters max).' }, { status: 400 });
  }
  if (description !== undefined && description.length > 2000) {
    return NextResponse.json({ error: 'Description is too long (2000 characters max).' }, { status: 400 });
  }
  for (const [label, value] of [['Problem', problem], ['Approach', approach], ['Result', result]]) {
    if (value && value.length > 1000) {
      return NextResponse.json({ error: `${label} is too long (1000 characters max).` }, { status: 400 });
    }
  }
  if (liveUrl && !isSafeHttpUrl(liveUrl)) {
    return NextResponse.json({ error: 'Live URL must be a valid http:// or https:// link.' }, { status: 400 });
  }
  if (githubUrl && !isSafeHttpUrl(githubUrl)) {
    return NextResponse.json({ error: 'GitHub URL must be a valid http:// or https:// link.' }, { status: 400 });
  }

  const work = await prisma.work.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title: title.trim() } : {}),
      ...(type !== undefined ? { type } : {}),
      ...(subCategory !== undefined ? { subCategory: type === 'design' ? (subCategory || null) : null } : {}),
      ...(description !== undefined ? { description: description.trim() } : {}),
      ...(techStack !== undefined ? { techStack: techStack ? String(techStack).slice(0, 500) : null } : {}),
      ...(liveUrl !== undefined ? { liveUrl: liveUrl || null } : {}),
      ...(githubUrl !== undefined ? { githubUrl: githubUrl || null } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(featured !== undefined ? { featured: Boolean(featured) } : {}),
      ...(imageUrl !== undefined ? { imageUrl } : {}),
      ...(thumbUrl !== undefined ? { thumbUrl } : {}),
      ...(blurDataUrl !== undefined ? { blurDataUrl } : {}),
      ...(problem !== undefined ? { problem: problem ? problem.trim() : null } : {}),
      ...(approach !== undefined ? { approach: approach ? approach.trim() : null } : {}),
      ...(result !== undefined ? { result: result ? result.trim() : null } : {}),
    },
  });

  await prisma.activity.create({
    data: { type: 'edit', message: `Admin updated "${work.title}"`, meta: JSON.stringify({ workId: id }) },
  });

  revalidatePath('/');

  return NextResponse.json(work);
}

export async function DELETE(request, { params }) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = parseInt(params.id, 10);
  const work = await prisma.work.delete({ where: { id } });

  await prisma.activity.create({
    data: { type: 'delete', message: `Admin deleted "${work.title}"` },
  });

  revalidatePath('/');

  return NextResponse.json({ success: true });
}
