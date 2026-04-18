import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  AUTH_COOKIE_NAME,
  isAuthConfigured,
  normalizeRedirectTarget,
  verifySessionToken,
} from '@/lib/auth';

function isPublicPath(pathname: string) {
  return pathname === '/login' || pathname.startsWith('/api/auth/');
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isPublicPath(pathname)) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const isAuthenticated = token ? await verifySessionToken(token) : false;

    if (pathname === '/login' && isAuthenticated) {
      return NextResponse.redirect(new URL('/attendance', request.url));
    }

    return NextResponse.next();
  }

  if (!isAuthConfigured()) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Chưa cấu hình APP_LOGIN_PASSWORD trên server.' },
        { status: 500 }
      );
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'config');
    return NextResponse.redirect(loginUrl);
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = token ? await verifySessionToken(token) : false;

  if (isAuthenticated) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set(
    'next',
    normalizeRedirectTarget(`${pathname}${search}`)
  );
  loginUrl.searchParams.set('error', 'unauthorized');

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
