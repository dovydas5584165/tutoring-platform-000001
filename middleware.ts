import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Protect the /test route
  if (request.nextUrl.pathname.startsWith('/test')) {
    
    // --- CHECK FOR YOUR COOKIE NAME ---
    const hasTicket = request.cookies.has('test_session_token');

    if (!hasTicket) {
      // If no ticket, kick them back to the sales page
      return NextResponse.redirect(new URL('/career_test', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/test/:path*'],
};
