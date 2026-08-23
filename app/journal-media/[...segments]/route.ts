import fs from 'node:fs';
import path from 'node:path';

import { NextResponse } from 'next/server';

import { resolveJournalMediaPath } from '@/lib/journal';

function getMimeType(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.heic') return 'image/heic';
  if (ext === '.heif') return 'image/heif';
  return 'application/octet-stream';
}

export async function GET(_: Request, context: { params: Promise<{ segments: string[] }> }) {
  const { segments } = await context.params;
  const candidate = segments.join('/');
  const absolutePath = resolveJournalMediaPath(candidate);

  if (!absolutePath || !fs.existsSync(absolutePath)) {
    return new NextResponse('Not found', { status: 404 });
  }

  const bytes = fs.readFileSync(absolutePath);
  return new NextResponse(bytes, {
    headers: {
      'content-type': getMimeType(absolutePath),
      'cache-control': 'private, max-age=60',
    },
  });
}
