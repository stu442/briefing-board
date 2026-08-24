import { NextResponse, type NextRequest } from 'next/server';

import { verifyAurelSession } from '@/lib/aurel-auth';

const publicPaths = new Set(['/login', '/api/auth/login', '/health']);

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (publicPaths.has(pathname)) return NextResponse.next();

  const valid = await verifyAurelSession(request.cookies.get('aurel_session')?.value, process.env.AUREL_SESSION_SECRET);
  if (valid) return NextResponse.next();

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('next', `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg).*)'] };
