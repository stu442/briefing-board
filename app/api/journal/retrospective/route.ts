import { NextResponse } from 'next/server';

import { getCurrentWeeklyRetrospectiveName, saveRetrospectiveNote } from '@/lib/retrospective';

export async function POST(request: Request) {
  const formData = await request.formData();
  const note = String(formData.get('note') || getCurrentWeeklyRetrospectiveName());
  const content = String(formData.get('content') || '');

  if (!content.trim()) {
    return NextResponse.redirect(new URL(`/journal/retrospective?note=${encodeURIComponent(note)}&error=empty`, request.url), { status: 303 });
  }

  try {
    const savedName = saveRetrospectiveNote(note, content);
    return NextResponse.redirect(new URL(`/journal/retrospective?note=${encodeURIComponent(savedName)}&saved=1`, request.url), { status: 303 });
  } catch {
    return NextResponse.redirect(new URL('/journal/retrospective?error=invalid-note', request.url), { status: 303 });
  }
}
