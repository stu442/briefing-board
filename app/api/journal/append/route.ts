import { Buffer } from 'node:buffer';

import { NextResponse } from 'next/server';

import { appendJournalEntry, getJournalHref, normalizeJournalSlug, saveJournalPhoto } from '@/lib/journal';

const MAX_FILE_BYTES = 15 * 1024 * 1024;

export async function POST(request: Request) {
  const formData = await request.formData();
  const rawSlug = String(formData.get('slug') || '');
  const slug = normalizeJournalSlug(rawSlug);
  const text = String(formData.get('text') || '');
  const fileValues = formData.getAll('photos');

  const savedPhotos: string[] = [];

  for (const value of fileValues) {
    if (!(value instanceof File)) continue;
    if (!value.size) continue;
    if (value.size > MAX_FILE_BYTES) {
      return NextResponse.redirect(new URL(`/journal/${slug || ''}?error=file-too-large`, request.url), { status: 303 });
    }
    if (value.type && !value.type.startsWith('image/')) {
      continue;
    }

    const bytes = new Uint8Array(await value.arrayBuffer());
    const saved = saveJournalPhoto({
      originalName: value.name || 'photo.jpg',
      bytes: Buffer.from(bytes),
    });
    savedPhotos.push(saved.obsidianPath);
  }

  const result = appendJournalEntry({
    slug,
    text,
    photoPaths: savedPhotos,
  });

  const destination = getJournalHref(result.slug);
  if (!result.appended) {
    return NextResponse.redirect(new URL(`${destination}?error=empty`, request.url), { status: 303 });
  }

  return NextResponse.redirect(new URL(`${destination}?saved=1`, request.url), { status: 303 });
}
