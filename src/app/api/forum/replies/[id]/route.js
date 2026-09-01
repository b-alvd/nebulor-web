import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getForumSession, initForumTables } from '@/lib/forum-session';

export async function PATCH(request, { params }) {
  try {
    await initForumTables();
    const session = await getForumSession();
    if (!session) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

    const { id } = await params;
    const { content, image_url } = await request.json();

    const row = await db.execute({ sql: 'SELECT author_id FROM forum_replies WHERE id = ?', args: [id] });
    if (!row.rows[0]) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 });
    if (Number(row.rows[0].author_id) !== session.userId) return NextResponse.json({ error: 'Interdit' }, { status: 403 });

    await db.execute({ sql: 'UPDATE forum_replies SET content = ?, image_url = ? WHERE id = ?', args: [content?.trim() ?? '', image_url ?? null, id] });
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
    const row = await db.execute({ sql: 'SELECT author_id, thread_id FROM forum_replies WHERE id = ?', args: [id] });
    if (!row.rows[0]) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 });
    if (Number(row.rows[0].author_id) !== session.userId) return NextResponse.json({ error: 'Interdit' }, { status: 403 });

    const threadId = row.rows[0].thread_id;
    await db.execute({ sql: 'DELETE FROM forum_replies WHERE id = ?', args: [id] });
    await db.execute({ sql: 'UPDATE forum_threads SET reply_count = MAX(0, reply_count - 1) WHERE id = ?', args: [threadId] });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
