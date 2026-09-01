import { NextResponse } from 'next/server';
import { destroyForumSession } from '@/lib/forum-session';

export async function GET(request) {
  await destroyForumSession();
  return NextResponse.redirect(new URL('/forum', request.url));
}
