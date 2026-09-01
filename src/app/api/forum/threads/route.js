import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getForumSession, initForumTables } from '@/lib/forum-session';

const VALID_CATEGORIES = ['general', 'theories', 'lore', 'questions'];

export async function GET(request) {
  try {
    await initForumTables();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const sql = category && VALID_CATEGORIES.includes(category)
      ? 'SELECT * FROM forum_threads WHERE category = ? ORDER BY pinned DESC, created_at DESC LIMIT 100'
      : 'SELECT * FROM forum_threads ORDER BY pinned DESC, created_at DESC LIMIT 100';

    const args = category && VALID_CATEGORIES.includes(category) ? [category] : [];
    const result = await db.execute({ sql, args });
    return NextResponse.json(result.rows);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request) {
  try {
    await initForumTables();
    const session = await getForumSession();
    if (!session) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

    const { category, title, content, image_url } = await request.json();

    if (!VALID_CATEGORIES.includes(category)) return NextResponse.json({ error: 'Catégorie invalide' }, { status: 400 });
    if (!title?.trim()) return NextResponse.json({ error: 'Titre requis' }, { status: 400 });
    if (title.trim().length > 200) return NextResponse.json({ error: 'Titre trop long' }, { status: 400 });

    const result = await db.execute({
      sql: 'INSERT INTO forum_threads (category, author_id, author_username, title, content, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      args: [category, session.userId, session.username, title.trim(), content?.trim() ?? null, image_url ?? null],
    });

    return NextResponse.json({ id: Number(result.lastInsertRowid) }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
