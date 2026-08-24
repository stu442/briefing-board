import { timingSafeEqual } from 'node:crypto';

import { NextResponse } from 'next/server';

import { createAurelSession } from '@/lib/aurel-auth';

function passwordsMatch(input: string, expected: string) {
  const inputBytes = Buffer.from(input);
  const expectedBytes = Buffer.from(expected);
  return inputBytes.length === expectedBytes.length && timingSafeEqual(inputBytes, expectedBytes);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get('password') || '');
  const next = String(formData.get('next') || '/journal');
  const expected = process.env.AUREL_AUTH_PASSWORD;
  const secret = process.env.AUREL_SESSION_SECRET;
  const destination = next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/login') ? next : '/journal';

  if (!expected || !secret || !passwordsMatch(password, expected)) {
    return NextResponse.redirect(new URL(`/login?error=invalid&next=${encodeURIComponent(destination)}`, request.url), { status: 303 });
  }

  const response = NextResponse.redirect(new URL(destination, request.url), { status: 303 });
  const isSecureRequest = new URL(request.url).protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https';
  response.cookies.set('aurel_session', await createAurelSession(secret), { httpOnly: true, sameSite: 'lax', secure: isSecureRequest, path: '/', maxAge: 60 * 60 * 24 * 30 });
  return response;
}
