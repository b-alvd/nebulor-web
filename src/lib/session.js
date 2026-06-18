import { cookies } from 'next/headers';
import { db } from '@/lib/db';

const COOKIE = 'nebulor_session';
const MAX_AGE = 60 * 60 * 24 * 30;

export async function createSession(discordId, username) {
  const token = crypto.randomUUID() + crypto.randomUUID();
  const expiresAt = new Date(Date.now() + MAX_AGE * 1000).toISOString();

  await db.execute({
    sql: 'INSERT INTO sessions (token, discord_id, username, expires_at) VALUES (?, ?, ?, ?)',
    args: [token, discordId, username, expiresAt],
  });

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function getSession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;

  const result = await db.execute({
    sql: 'SELECT * FROM sessions WHERE token = ? LIMIT 1',
    args: [token],
  });

  const row = result.rows[0];
  if (!row) return null;

  if (new Date(row.expires_at).getTime() < Date.now()) {
    await db.execute({ sql: 'DELETE FROM sessions WHERE token = ?', args: [token] });
    return null;
  }

  // Vérifie que le discord_id est admin
  const admin = await db.execute({
    sql: 'SELECT id FROM admins WHERE discord_id = ?',
    args: [row.discord_id],
  });
  if (admin.rows.length === 0) return null;

  return { discordId: row.discord_id, username: row.username };
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) await db.execute({ sql: 'DELETE FROM sessions WHERE token = ?', args: [token] });
  store.delete(COOKIE);
}
