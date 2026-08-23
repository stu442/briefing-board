import { NextResponse } from 'next/server';

import { normalizeJournalSlug, saveJournalNote } from '@/lib/journal';

export async function POST(request: Request) {
  const formData = await request.formData();
  const slug = normalizeJournalSlug(String(formData.get('slug') || ''));
  const content = String(formData.get('content') || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(slug) || !content.trim()) return NextResponse.redirect(new URL('/journal?error=invalid-note', request.url), { status: 303 });
  saveJournalNote(slug, content);
  return NextResponse.redirect(new URL(`/journal/${slug}?saved=1`, request.url), { status: 303 });
}
