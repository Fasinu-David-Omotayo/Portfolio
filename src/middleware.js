import { NextResponse } from 'next/server';
import { verifySessionToken } from './lib/jwt';

// This is the actual security boundary for the admin area: no valid
// session, no access to anything under /admin/dashboard. Enforced here,
// server-side, rather than just hidden in the UI.
//
// A stricter version of this file also added security response headers
// (Content-Security-Policy and friends). Two different attempts at that
// each broke the site in a different way - one crashed every request
// outright, the other got the whole site stuck on its loading screen
// forever, because it interfered with how Next.js's App Router streams
// content. Given that, this file is deliberately kept minimal and
// reliable rather than maximally strict. If you want to revisit CSP/
// security headers later, add them carefully and test a real production
// build (not just `next build` succeeding) before trusting it.
export async function middleware(request) {
  if (request.nextUrl.pathname.startsWith('/admin/dashboard')) {
    const token = request.cookies.get('session')?.value;
    const session = token ? await verifySessionToken(token) : null;
    if (!session) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/dashboard/:path*'],
};
