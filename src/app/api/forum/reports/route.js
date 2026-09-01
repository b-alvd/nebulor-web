import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getForumSession, initForumTables } from '@/lib/forum-session';

export async function POST(request) {
  try {
    await initForumTables();
    const session = await getForumSession();
    if (!session) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

    const { target_type, target_id, reason } = await request.json();
    if (!['thread', 'reply'].includes(target_type)) return NextResponse.json({ error: 'Type invalide' }, { status: 400 });
    if (!reason?.trim()) return NextResponse.json({ error: 'Raison requise' }, { status: 400 });

    await db.execute({
      sql: `CREATE TABLE IF NOT EXISTS forum_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reporter_id INTEGER NOT NULL,
        reporter_username TEXT NOT NULL,
        target_type TEXT NOT NULL,
        target_id INTEGER NOT NULL,
        reason TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      )`,
      args: [],
    });

    await db.execute({
      sql: 'INSERT INTO forum_reports (reporter_id, reporter_username, target_type, target_id, reason) VALUES (?, ?, ?, ?, ?)',
      args: [session.userId, session.username, target_type, target_id, reason.trim()],
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
