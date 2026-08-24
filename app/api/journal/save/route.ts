import { Buffer } from 'node:buffer';

import { NextResponse } from 'next/server';

import { normalizeJournalSlug, saveJournalNote, saveJournalPhoto } from '@/lib/journal';

const MAX_FILE_BYTES = 15 * 1024 * 1024;

export async function POST(request: Request) {
  const formData = await request.formData();
  const slug = normalizeJournalSlug(String(formData.get('slug') || ''));
  const content = String(formData.get('content') || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(slug) || !content.trim()) return NextResponse.redirect(new URL('/journal?error=invalid-note', request.url), { status: 303 });

  const photoPaths: string[] = [];
  for (const value of formData.getAll('photos')) {
    if (!(value instanceof File) || !value.size) continue;
    if (value.size > MAX_FILE_BYTES || (value.type && !value.type.startsWith('image/'))) {
      return NextResponse.redirect(new URL(`/journal/edit/${slug}?error=invalid-photo`, request.url), { status: 303 });
    }
    photoPaths.push(saveJournalPhoto({ originalName: value.name || 'photo.jpg', bytes: Buffer.from(await value.arrayBuffer()) }).obsidianPath);
  }

  const contentWithPhotos = photoPaths.length ? `${content.trimEnd()}\n\n${photoPaths.map((photoPath) => `![[${photoPath}]]`).join('\n')}\n` : content;
  saveJournalNote(slug, contentWithPhotos);
  return NextResponse.redirect(new URL(`/journal/${slug}?saved=1`, request.url), { status: 303 });
}
