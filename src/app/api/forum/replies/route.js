import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getForumSession, initForumTables } from '@/lib/forum-session';

export async function POST(request) {
  try {
    await initForumTables();
    const session = await getForumSession();
    if (!session) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

    const { thread_id, content, image_url } = await request.json();
    if (!thread_id || (!content?.trim() && !image_url)) return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    if (content?.trim().length > 4000) return NextResponse.json({ error: 'Message trop long' }, { status: 400 });

    const thread = await db.execute({ sql: 'SELECT id FROM forum_threads WHERE id = ?', args: [thread_id] });
    if (!thread.rows[0]) return NextResponse.json({ error: 'Thread introuvable' }, { status: 404 });

    await db.execute({
      sql: 'INSERT INTO forum_replies (thread_id, author_id, author_username, content, image_url) VALUES (?, ?, ?, ?, ?)',
      args: [thread_id, session.userId, session.username, content?.trim() ?? '', image_url ?? null],
    });
    await db.execute({
      sql: 'UPDATE forum_threads SET reply_count = reply_count + 1 WHERE id = ?',
      args: [thread_id],
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
