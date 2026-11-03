import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import { isSameOrigin } from '@/lib/csrf';
import { isValidImageUrl, isSafeHttpUrl } from '@/lib/validation';
import { CATEGORY_VALUES } from '@/lib/categories';

export const dynamic = 'force-dynamic';

const TYPES = ['dev', 'design', 'data'];

// Public - powers the portfolio gallery on the live site.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const includesDrafts = searchParams.get('includeDrafts') === 'true';

  const session = includesDrafts ? await getSession() : null;

  const where = {
    ...(type && type !== 'all' ? { type } : {}),
    ...(session ? {} : { status: 'live' }),
  };

  const works = await prisma.work.findMany({
    where,
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    include: { images: { orderBy: { order: 'asc' } } },
  });
  return NextResponse.json(works);
}

// Protected - admin creates a new work entry (after uploading the cover image via /api/upload).
export async function POST(request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { title, type, subCategory, description, techStack, liveUrl, githubUrl, imageUrl, thumbUrl, blurDataUrl, status, featured, problem, approach, result, kind, kindNote, extraUrl, extraLabel } = body;

  if (!title || !type || !imageUrl) {
    return NextResponse.json({ error: 'Title, type, and image are required.' }, { status: 400 });
  }
  if (!TYPES.includes(type)) {
    return NextResponse.json({ error: 'Invalid work type.' }, { status: 400 });
  }
  if (type === 'design' && subCategory && !CATEGORY_VALUES.includes(subCategory)) {
    return NextResponse.json({ error: 'Invalid design sub-category.' }, { status: 400 });
  }
  if (!isValidImageUrl(imageUrl) || (thumbUrl && !isValidImageUrl(thumbUrl))) {
    return NextResponse.json({ error: 'Image must come from the upload endpoint.' }, { status: 400 });
  }
  if (title.length > 200) {
    return NextResponse.json({ error: 'Title is too long (200 characters max).' }, { status: 400 });
  }
  if (description && description.length > 2000) {
    return NextResponse.json({ error: 'Description is too long (2000 characters max).' }, { status: 400 });
  }
  for (const [label, value] of [['Problem', problem], ['Approach', approach], ['Result', result]]) {
    if (value && value.length > 1000) {
      return NextResponse.json({ error: `${label} is too long (1000 characters max).` }, { status: 400 });
    }
  }
  if (kind !== undefined && !['', 'client', 'personal', 'concept'].includes(kind || '')) {
    return NextResponse.json({ error: 'Invalid work label.' }, { status: 400 });
  }
  if (kindNote && kindNote.length > 300) {
    return NextResponse.json({ error: 'Label note is too long (300 characters max).' }, { status: 400 });
  }
  if (extraLabel && extraLabel.length > 40) {
    return NextResponse.json({ error: 'Extra link label is too long (40 characters max).' }, { status: 400 });
  }
  if (extraUrl && !isSafeHttpUrl(extraUrl)) {
    return NextResponse.json({ error: 'Extra link must be a valid http:// or https:// link.' }, { status: 400 });
  }
  if (liveUrl && !isSafeHttpUrl(liveUrl)) {
    return NextResponse.json({ error: 'Live URL must be a valid http:// or https:// link.' }, { status: 400 });
  }
  if (githubUrl && !isSafeHttpUrl(githubUrl)) {
    return NextResponse.json({ error: 'GitHub URL must be a valid http:// or https:// link.' }, { status: 400 });
  }

  const work = await prisma.work.create({
    data: {
      title: title.trim(),
      type,
      subCategory: type === 'design' ? (subCategory || null) : null,
      description: (description || '').trim(),
      techStack: techStack ? String(techStack).slice(0, 500) : null,
      liveUrl: liveUrl || null,
      githubUrl: githubUrl || null,
      imageUrl,
      thumbUrl: thumbUrl || imageUrl,
      blurDataUrl: blurDataUrl || null,
      status: status === 'draft' ? 'draft' : 'live',
      featured: Boolean(featured),
      problem: problem ? problem.trim() : null,
      approach: approach ? approach.trim() : null,
      result: result ? result.trim() : null,
      kind: kind || '',
      kindNote: kindNote ? kindNote.trim() : null,
      extraUrl: extraUrl || null,
      extraLabel: extraLabel ? extraLabel.trim() : null,
    },
  });

  await prisma.activity.create({
    data: {
      type: 'upload',
      message: `Admin uploaded "${title}" (${type})`,
      meta: JSON.stringify({ workId: work.id }),
    },
  });

  revalidatePath('/');

  return NextResponse.json(work);
}