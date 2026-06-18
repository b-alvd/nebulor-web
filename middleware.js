import { NextResponse } from 'next/server';

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const isLogin = pathname === '/admin/login';
  const token = req.cookies.get('nebulor_session')?.value;

  if (!isLogin && !token) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }
  if (isLogin && token) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};
