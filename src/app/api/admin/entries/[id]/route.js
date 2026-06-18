import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const { name, image_url, sort_order, fields } = await req.json();
  await db.execute({ sql: "UPDATE entries SET name=?,image_url=?,sort_order=?,updated_at=datetime('now') WHERE id=?", args: [name, image_url||null, sort_order||0, id] });
  await db.execute({ sql: 'DELETE FROM entry_fields WHERE entry_id=?', args: [id] });
  if (fields) for (const [key, value] of Object.entries(fields)) if (value) await db.execute({ sql: 'INSERT INTO entry_fields (entry_id,key,value) VALUES (?,?,?)', args: [id, key, value] });
  return NextResponse.json({ success: true });
}

export async function DELETE(req, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  await db.execute({ sql: 'DELETE FROM entries WHERE id=?', args: [id] });
  return NextResponse.json({ success: true });
}
