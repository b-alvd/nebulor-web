import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const chapters = await db.execute({ sql: 'SELECT * FROM chapters ORDER BY sort_order, episode_no', args: [] });
  const result = await Promise.all(chapters.rows.map(async (ch) => {
    const images = await db.execute({ sql: 'SELECT * FROM chapter_images WHERE chapter_id=? ORDER BY sort_order', args: [ch.id] });
    return { ...ch, images: images.rows };
  }));
  return NextResponse.json(result);
}

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { title, episode_no, webtoon_url, sort_order } = await req.json();
  const r = await db.execute({ sql: 'INSERT INTO chapters (title,episode_no,webtoon_url,sort_order) VALUES (?,?,?,?) RETURNING *', args: [title, episode_no||null, webtoon_url||null, sort_order||0] });
  return NextResponse.json(r.rows[0], { status: 201 });
}

export async function DELETE(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  await db.execute({ sql: 'DELETE FROM chapters WHERE id=?', args: [searchParams.get('id')] });
  return NextResponse.json({ success: true });
}
