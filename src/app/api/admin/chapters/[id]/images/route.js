import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const { image_url, sort_order } = await req.json();
  const r = await db.execute({ sql: 'INSERT INTO chapter_images (chapter_id,image_url,sort_order) VALUES (?,?,?) RETURNING *', args: [id, image_url, sort_order||0] });
  return NextResponse.json(r.rows[0], { status: 201 });
}

export async function DELETE(req, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  await db.execute({ sql: 'DELETE FROM chapter_images WHERE id=? AND chapter_id=?', args: [searchParams.get('image_id'), id] });
  return NextResponse.json({ success: true });
}
