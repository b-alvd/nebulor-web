import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';

const COOKIE = 'nebulor_forum';
const MAX_AGE = 60 * 60 * 24 * 30;

let tablesReady = false;
// Bump this number whenever the schema changes to force re-migration
const SCHEMA_VERSION = 2;

export async function initForumTables() {
  // Migrations légères toujours vérifiées (ALTER TABLE idempotent)
  try {
    const rc = await db.execute({ sql: `PRAGMA table_info(forum_replies)`, args: [] });
    if (rc.rows.length > 0 && !rc.rows.some(r => r.name === 'image_url')) {
      await db.execute({ sql: `ALTER TABLE forum_replies ADD COLUMN image_url TEXT`, args: [] });
    }
  } catch { /* table n'existe pas encore, sera créée dessous */ }

  if (tablesReady) return;
  await db.execute({ sql: `CREATE TABLE IF NOT EXISTS forum_users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, username TEXT NOT NULL, password_hash TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')))`, args: [] });

  // Recrée forum_sessions si le schéma est incompatible (migration)
  const cols = await db.execute({ sql: `PRAGMA table_info(forum_sessions)`, args: [] });
  const hasUserId = cols.rows.some(r => r.name === 'user_id');
  if (!hasUserId) {
    await db.execute({ sql: `DROP TABLE IF EXISTS forum_sessions`, args: [] });
  }
  await db.execute({ sql: `CREATE TABLE IF NOT EXISTS forum_sessions (token TEXT PRIMARY KEY, user_id INTEGER NOT NULL, username TEXT NOT NULL, expires_at TEXT NOT NULL)`, args: [] });

  // Recrée forum_threads si schéma Discord legacy (author_discord_id)
  const threadCols = await db.execute({ sql: `PRAGMA table_info(forum_threads)`, args: [] });
  const threadColNames = threadCols.rows.map(r => r.name);
  if (threadColNames.includes('author_discord_id')) {
    await db.execute({ sql: `DROP TABLE IF EXISTS forum_threads`, args: [] });
  }
  await db.execute({ sql: `CREATE TABLE IF NOT EXISTS forum_threads (id INTEGER PRIMARY KEY AUTOINCREMENT, category TEXT NOT NULL, author_id INTEGER NOT NULL, author_username TEXT NOT NULL, title TEXT NOT NULL, content TEXT, image_url TEXT, pinned INTEGER DEFAULT 0, reply_count INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')))`, args: [] });

  // Recrée forum_replies si schéma Discord legacy
  const replyCols = await db.execute({ sql: `PRAGMA table_info(forum_replies)`, args: [] });
  const replyColNames = replyCols.rows.map(r => r.name);
  if (replyColNames.includes('author_discord_id')) {
    await db.execute({ sql: `DROP TABLE IF EXISTS forum_replies`, args: [] });
  }
  await db.execute({ sql: `CREATE TABLE IF NOT EXISTS forum_replies (id INTEGER PRIMARY KEY AUTOINCREMENT, thread_id INTEGER NOT NULL, author_id INTEGER NOT NULL, author_username TEXT NOT NULL, content TEXT NOT NULL, image_url TEXT, created_at TEXT DEFAULT (datetime('now')))`, args: [] });
  // Ajoute image_url si manquante (ne dépend pas de tablesReady)
  const replyCols2 = await db.execute({ sql: `PRAGMA table_info(forum_replies)`, args: [] });
  if (!replyCols2.rows.some(r => r.name === 'image_url')) {
    await db.execute({ sql: `ALTER TABLE forum_replies ADD COLUMN image_url TEXT`, args: [] });
  }
  tablesReady = true;
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  try {
    const [salt, hash] = stored.split(':');
    const hashBuf = Buffer.from(hash, 'hex');
    const supplied = scryptSync(password, salt, 64);
    return timingSafeEqual(hashBuf, supplied);
  } catch {
    return false;
  }
}

export async function createForumSession(userId, username) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + MAX_AGE * 1000).toISOString();

  await db.execute({
    sql: 'INSERT INTO forum_sessions (token, user_id, username, expires_at) VALUES (?, ?, ?, ?)',
    args: [token, userId, username, expiresAt],
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

export async function getForumSession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;

  const result = await db.execute({
    sql: 'SELECT * FROM forum_sessions WHERE token = ? LIMIT 1',
    args: [token],
  });

  const row = result.rows[0];
  if (!row) return null;

  if (new Date(row.expires_at).getTime() < Date.now()) {
    await db.execute({ sql: 'DELETE FROM forum_sessions WHERE token = ?', args: [token] });
    return null;
  }

  return { userId: row.user_id, username: row.username };
}

export async function destroyForumSession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) await db.execute({ sql: 'DELETE FROM forum_sessions WHERE token = ?', args: [token] });
  store.delete(COOKIE);
}
