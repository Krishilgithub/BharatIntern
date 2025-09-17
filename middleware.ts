import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const token = req.cookies.get('bi_user');
  const isProtected = url.pathname.startsWith('/candidate') || url.pathname.startsWith('/company') || url.pathname.startsWith('/admin');

  if (isProtected && !token) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/candidate/:path*', '/company/:path*', '/admin/:path*'],
};

