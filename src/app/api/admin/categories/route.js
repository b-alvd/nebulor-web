import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const cats = await db.execute({ sql: 'SELECT *, (SELECT COUNT(*) FROM entries WHERE category_id = categories.id) as count FROM categories ORDER BY sort_order', args: [] });
  return NextResponse.json(cats.rows);
}

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { slug, label, icon, description, color, sort_order } = await req.json();
  const r = await db.execute({ sql: 'INSERT INTO categories (slug,label,icon,description,color,sort_order) VALUES (?,?,?,?,?,?) RETURNING *', args: [slug, label, icon||'◈', description||'', color||'#4ecdc4', sort_order||0] });
  return NextResponse.json(r.rows[0], { status: 201 });
}

export async function DELETE(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  await db.execute({ sql: 'DELETE FROM categories WHERE id=?', args: [searchParams.get('id')] });
  return NextResponse.json({ success: true });
}
