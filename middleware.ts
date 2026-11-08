/**
 * Edge middleware:
 *  - /test is only reachable with a valid, signed `test_session_token` cookie (paid or redeemed code).
 *  - Dot-files like /.git and /.env always 404, even if one ever ends up in the deployment.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { TEST_COOKIE, verifyTestSession } from './lib/testSession';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (/^\/\.(git|env|svn|hg|DS_Store)/i.test(pathname)) {
    return new NextResponse('Not found', { status: 404 });
  }

  if (pathname === '/test' || pathname.startsWith('/test/')) {
    const ok = await verifyTestSession(request.cookies.get(TEST_COOKIE)?.value);
    if (!ok) {
      const res = NextResponse.redirect(new URL('/career_test', request.url));
      res.cookies.delete(TEST_COOKIE);
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/test', '/test/:path*', '/.git/:path*', '/.env', '/.env.:suffix'],
};
