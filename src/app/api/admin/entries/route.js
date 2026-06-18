import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('category');
  const sql = slug
    ? 'SELECT e.*, c.slug as category_slug, c.label as category_label FROM entries e JOIN categories c ON e.category_id=c.id WHERE c.slug=? ORDER BY e.sort_order, e.name'
    : 'SELECT e.*, c.slug as category_slug, c.label as category_label FROM entries e JOIN categories c ON e.category_id=c.id ORDER BY c.sort_order, e.sort_order, e.name';
  const entries = await db.execute({ sql, args: slug ? [slug] : [] });
  const result = await Promise.all(entries.rows.map(async (entry) => {
    const fields = await db.execute({ sql: 'SELECT key, value FROM entry_fields WHERE entry_id=?', args: [entry.id] });
    return { ...entry, fields: Object.fromEntries(fields.rows.map(f => [f.key, f.value])) };
  }));
  return NextResponse.json(result);
}

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { category_id, name, image_url, sort_order, fields } = await req.json();
  const entry = await db.execute({ sql: 'INSERT INTO entries (category_id,name,image_url,sort_order) VALUES (?,?,?,?) RETURNING *', args: [category_id, name, image_url||null, sort_order||0] });
  const entryId = entry.rows[0].id;
  if (fields) for (const [key, value] of Object.entries(fields)) if (value) await db.execute({ sql: 'INSERT INTO entry_fields (entry_id,key,value) VALUES (?,?,?)', args: [entryId, key, value] });
  return NextResponse.json(entry.rows[0], { status: 201 });
}
