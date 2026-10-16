import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import { isSameOrigin } from '@/lib/csrf';
import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const workId = parseInt(params.id, 10);
  if (!Number.isInteger(workId)) {
    return NextResponse.json({ error: 'Invalid work id.' }, { status: 400 });
  }

  const work = await prisma.work.findUnique({ where: { id: workId } });
  if (!work) return NextResponse.json({ error: 'Work not found.' }, { status: 404 });

  const formData = await request.formData();
  const file = formData.get('file');

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }
  if (!file.type || !file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image files are allowed.' }, { status: 400 });
  }
  if (file.size > 20 * 1024 * 1024) {
    return NextResponse.json({ error: 'Image must be under 20MB.' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;

  let fullBuffer, blurDataUrl;
  try {
    fullBuffer = await sharp(buffer)
      .resize({ width: 2000, withoutEnlargement: true })
      .webp({ quality: 92 })
      .toBuffer();

    const tinyBuffer = await sharp(buffer)
      .resize({ width: 24 })
      .webp({ quality: 40 })
      .toBuffer();
    blurDataUrl = `data:image/webp;base64,${tinyBuffer.toString('base64')}`;
  } catch (err) {
    return NextResponse.json({ error: 'Could not process this image. Try a different file.' }, { status: 400 });
  }

  let imageUrl;
  if (process.env.VERCEL || process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob');
    const full = await put(`works/${filename}-sub.webp`, fullBuffer, {
      access: 'public',
      contentType: 'image/webp',
      cacheControlMaxAge: 31536000,
    });
    imageUrl = full.url;
  } else {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, `${filename}-sub.webp`), fullBuffer);
    imageUrl = `/uploads/${filename}-sub.webp`;
  }

  const lastImage = await prisma.workImage.findFirst({
    where: { workId },
    orderBy: { order: 'desc' },
  });
  const nextOrder = lastImage ? lastImage.order + 1 : 0;

  const image = await prisma.workImage.create({
    data: { workId, imageUrl, blurDataUrl, order: nextOrder },
  });

  revalidatePath('/');

  return NextResponse.json(image);
}
