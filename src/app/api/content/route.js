import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import { getSiteContent } from '@/lib/siteContent';
import { isSameOrigin } from '@/lib/csrf';
import { isValidImageUrl, isValidUploadUrl, isSafeHttpUrl } from '@/lib/validation';

export const dynamic = 'force-dynamic';

const EDITABLE_FIELDS = [
  'heroName', 'heroRoles', 'heroTagline', 'heroSubtext',
  'heroStatProjects', 'heroStatYears', 'heroStatClients', 'cvUrl', 'logoUrl',
  'aboutHeadingLine1', 'aboutHeadingLine2', 'aboutParagraph1', 'aboutParagraph2',
  'aboutImageUrl', 'aboutImageBlurDataUrl', 'aboutArtImageUrl', 'aboutArtImageBlurDataUrl',
  'contactHeadingLine1', 'contactHeadingLine2', 'contactSubtext', 'contactEmail',
  'githubUrl', 'linkedinUrl', 'instagramUrl', 'twitterUrl', 'whatsappUrl',
];
const NUMBER_FIELDS = ['heroStatProjects', 'heroStatYears', 'heroStatClients'];
// Hand-typed external links only - these must be full http(s):// URLs.
const URL_FIELDS = ['githubUrl', 'linkedinUrl', 'instagramUrl', 'twitterUrl'];
const IMAGE_FIELDS = ['aboutImageUrl', 'aboutArtImageUrl', 'logoUrl'];
// Comes from our own upload pipeline, not hand-typed - locally that's a
// relative /uploads/... path, not a full URL (see isValidUploadUrl).
const UPLOAD_FIELDS = ['cvUrl'];
const BLUR_FIELDS = ['aboutImageBlurDataUrl', 'aboutArtImageBlurDataUrl'];
const MAX_SHORT_TEXT = 300;
const MAX_LONG_TEXT = 2000;

export async function GET() {
  const content = await getSiteContent();
  return NextResponse.json(content);
}

export async function PUT(request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const data = {};

  for (const field of EDITABLE_FIELDS) {
    if (body[field] === undefined) continue;

    if (NUMBER_FIELDS.includes(field)) {
      const num = parseInt(body[field], 10);
      data[field] = Number.isFinite(num) ? Math.max(0, Math.min(num, 1000000)) : 0;
      continue;
    }

    if (BLUR_FIELDS.includes(field)) {
      const value = String(body[field] || '');
      data[field] = value.startsWith('data:image/') && value.length < 20000 ? value : null;
      continue;
    }

    // Stored as digits only (country code + number, e.g. 2348012345678) so
    // the public Contact section can build a real wa.me link out of it -
    // a pasted full URL or a number with spaces/dashes/a leading + would
    // otherwise send visitors to WhatsApp's download page instead of
    // opening a chat.
    if (field === 'whatsappUrl') {
      const raw = String(body[field] || '').trim();
      if (raw === '') {
        data.whatsappUrl = null;
      } else {
        const digits = raw.replace(/[^\d]/g, '');
        if (digits.length < 7 || digits.length > 15) {
          return NextResponse.json(
            { error: 'WhatsApp number should include the country code, digits only (e.g. 2348012345678).' },
            { status: 400 }
          );
        }
        data.whatsappUrl = digits;
      }
      continue;
    }

    const value = String(body[field]).trim();

    if (IMAGE_FIELDS.includes(field)) {
      if (value === '') {
        data[field] = null;
      } else if (!isValidImageUrl(value)) {
        return NextResponse.json({ error: 'Image must come from the upload endpoint.' }, { status: 400 });
      } else {
        data[field] = value;
      }
      continue;
    }

    if (URL_FIELDS.includes(field)) {
      if (value === '') {
        data[field] = null;
      } else if (!isSafeHttpUrl(value)) {
        return NextResponse.json(
          { error: `${field.replace('Url', '')} link must be a valid http:// or https:// URL.` },
          { status: 400 }
        );
      } else if (value.length > MAX_SHORT_TEXT) {
        return NextResponse.json({ error: 'That link is too long.' }, { status: 400 });
      } else {
        data[field] = value;
      }
      continue;
    }

    if (UPLOAD_FIELDS.includes(field)) {
      if (value === '') {
        data[field] = null;
      } else if (!isValidUploadUrl(value)) {
        return NextResponse.json({ error: 'CV must come from the upload field above.' }, { status: 400 });
      } else {
        data[field] = value;
      }
      continue;
    }

    const maxLen = field.toLowerCase().includes('paragraph') || field.toLowerCase().includes('subtext')
      ? MAX_LONG_TEXT
      : MAX_SHORT_TEXT;
    if (value.length > maxLen) {
      return NextResponse.json({ error: `That field is too long (${maxLen} characters max).` }, { status: 400 });
    }
    if (field === 'contactEmail' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return NextResponse.json({ error: 'Contact email must be a valid email address.' }, { status: 400 });
    }
    data[field] = value;
  }

  await getSiteContent();
  const updated = await prisma.siteContent.update({ where: { id: 1 }, data });

  await prisma.activity.create({
    data: { type: 'edit', message: 'Admin updated site content' },
  });

  revalidatePath('/');

  return NextResponse.json(updated);
}