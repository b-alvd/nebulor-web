import { NextResponse } from 'next/server';
import { getForumSession } from '@/lib/forum-session';

export async function GET() {
  try {
    const session = await getForumSession();
    if (!session) return NextResponse.json(null, { status: 401 });
    return NextResponse.json(session);
  } catch {
    return NextResponse.json(null, { status: 401 });
  }
}
