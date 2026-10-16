import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { isSameOrigin } from '@/lib/csrf';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic'; // ensures Vercel always routes every HTTP method to this function

// Separate from /api/upload on purpose: that route runs every file through
// sharp (image resize + WebP conversion), which only understands images.
// A CV is a PDF, not an image, so it needs its own route that stores the
// file as-is - no image processing, just a straight upload to the same
// storage (Vercel Blob in production, /public/uploads locally).

const ALLOWED_TYPES = new Set(['application/pdf']);
const MAX_SIZE = 10 * 1024 * 1024; // 10MB - plenty for a CV, small enough to stay under Vercel's request body limit

export async function POST(request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('file');

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Only PDF files are allowed.' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File must be under 10MB.' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `cv-${Date.now()}-${Math.round(Math.random() * 1e6)}.pdf`;

  // Same production/local split as /api/upload: Vercel Blob when deployed
  // (or a Blob store is configured), a local /public/uploads folder otherwise.
  if (process.env.VERCEL || process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob');
    const blob = await put(`documents/${filename}`, buffer, {
      access: 'public',
      contentType: 'application/pdf',
      cacheControlMaxAge: 31536000,
    });
    return NextResponse.json({ fileUrl: blob.url });
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);

  return NextResponse.json({ fileUrl: `/uploads/${filename}` });
}
