import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Is the user trying to go to the test questions?
  if (request.nextUrl.pathname.startsWith('/test/')) {
    
    // 2. Do they have the "ticket" (cookie)?
    const session = request.cookies.get('test_session_token');

    // 3. No ticket? Kick them back to the sales page.
    if (!session) {
      return NextResponse.redirect(new URL('/career_test', request.url));
    }
  }

  return NextResponse.next();
}

// Only run this check on routes starting with /test/
export const config = {
  matcher: '/test/:path*',
};
