import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // DEBUG LOG: Watch your server logs to see this running
  console.log("🔒 Checking path:", path);

  // FIXED LOGIC: Check if it IS '/test' OR starts with '/test/'
  // This covers both "tiksliukai.lt/test" and "tiksliukai.lt/test/questions"
  if (path === '/test' || path.startsWith('/test/')) {
    
    const session = request.cookies.get('test_session_token');

    if (!session) {
      console.log("⛔ Access Denied. Redirecting...");
      // Redirect back to the sales page
      return NextResponse.redirect(new URL('/career_test', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Update matcher to be safer
  matcher: [
    '/test',       // Matches /test exactly
    '/test/:path*' // Matches /test/questions, /test/results, etc.
  ],
};
