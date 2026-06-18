import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/session';

export async function GET(request) {
  await destroySession();
  return NextResponse.redirect(new URL('/admin/login', request.url));
}
