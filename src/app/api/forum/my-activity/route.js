import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getForumSession } from '@/lib/forum-session';

export async function GET(request) {
  try {
    const session = await getForumSession();
    if (!session) return NextResponse.json(null, { status: 401 });

    const limit = Number(new URL(request.url).searchParams.get('limit') ?? 50);

    const [threads, replies] = await Promise.all([
      db.execute({
        sql: `SELECT id, category, title, created_at FROM forum_threads WHERE author_id = ? ORDER BY created_at DESC LIMIT ${limit}`,
        args: [session.userId],
      }),
      db.execute({
        sql: `SELECT r.id, r.thread_id, r.content, r.created_at, t.title as thread_title, t.category
              FROM forum_replies r
              JOIN forum_threads t ON t.id = r.thread_id
              WHERE r.author_id = ?
              ORDER BY r.created_at DESC LIMIT ${limit}`,
        args: [session.userId],
      }),
    ]);

    return NextResponse.json({ threads: threads.rows, replies: replies.rows });
  } catch {
    return NextResponse.json({ threads: [], replies: [] });
  }
}
