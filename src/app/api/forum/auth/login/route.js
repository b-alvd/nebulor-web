import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { initForumTables, verifyPassword, createForumSession } from '@/lib/forum-session';

export async function POST(request) {
  try {
    await initForumTables();
    const { email, password } = await request.json();

    if (!email?.trim() || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis.' }, { status: 400 });
    }

    const result = await db.execute({
      sql: 'SELECT * FROM forum_users WHERE email = ? LIMIT 1',
      args: [email.trim().toLowerCase()],
    });

    const user = result.rows[0];
    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect.' }, { status: 401 });
    }

    await createForumSession(user.id, user.username);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[forum/login]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
