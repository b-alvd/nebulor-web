import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { initForumTables, hashPassword, createForumSession } from '@/lib/forum-session';

export async function POST(request) {
  try {
    await initForumTables();
    const { email, username, password } = await request.json();

    if (!email?.trim() || !username?.trim() || !password) {
      return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email invalide.' }, { status: 400 });
    }
    if (username.trim().length < 2 || username.trim().length > 32) {
      return NextResponse.json({ error: 'Pseudo entre 2 et 32 caractères.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Mot de passe minimum 8 caractères.' }, { status: 400 });
    }

    const existing = await db.execute({
      sql: 'SELECT id FROM forum_users WHERE email = ?',
      args: [email.trim().toLowerCase()],
    });
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé.' }, { status: 409 });
    }

    const hash = hashPassword(password);
    const result = await db.execute({
      sql: 'INSERT INTO forum_users (email, username, password_hash) VALUES (?, ?, ?)',
      args: [email.trim().toLowerCase(), username.trim(), hash],
    });

    await createForumSession(Number(result.lastInsertRowid), username.trim());
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error('[forum/register]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
