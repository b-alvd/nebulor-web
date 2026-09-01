import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getForumSession } from '@/lib/forum-session';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const [thread, replies] = await Promise.all([
      db.execute({ sql: 'SELECT * FROM forum_threads WHERE id = ? LIMIT 1', args: [id] }),
      db.execute({ sql: 'SELECT * FROM forum_replies WHERE thread_id = ? ORDER BY created_at ASC', args: [id] }),
    ]);

    if (!thread.rows[0]) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 });
    return NextResponse.json({ thread: thread.rows[0], replies: replies.rows });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getForumSession();
    if (!session) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

    const { id } = await params;
    const { title, content, image_url } = await request.json();
    if (!title?.trim()) return NextResponse.json({ error: 'Titre requis' }, { status: 400 });

    const row = await db.execute({ sql: 'SELECT author_id FROM forum_threads WHERE id = ?', args: [id] });
    if (!row.rows[0]) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 });
    if (Number(row.rows[0].author_id) !== session.userId) return NextResponse.json({ error: 'Interdit' }, { status: 403 });

    await db.execute({
      sql: 'UPDATE forum_threads SET title = ?, content = ?, image_url = ? WHERE id = ?',
      args: [title.trim(), content?.trim() ?? null, image_url ?? null, id],
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getForumSession();
    if (!session) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

    const { id } = await params;
    const thread = await db.execute({ sql: 'SELECT author_id FROM forum_threads WHERE id = ?', args: [id] });
    if (!thread.rows[0]) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 });
    if (Number(thread.rows[0].author_id) !== session.userId) {
      return NextResponse.json({ error: 'Interdit' }, { status: 403 });
    }

    await db.batch([
      { sql: 'DELETE FROM forum_replies WHERE thread_id = ?', args: [id] },
      { sql: 'DELETE FROM forum_threads WHERE id = ?', args: [id] },
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
