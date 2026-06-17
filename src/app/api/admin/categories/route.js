import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const result = await db.execute({
    sql: 'SELECT * FROM chapters ORDER BY sort_order, episode_no',
    args: [],
  });
  return NextResponse.json(result.rows);
}

export async function POST(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { title, episode_no, webtoon_url, image_url, sort_order } = body;

  const result = await db.execute({
    sql: 'INSERT INTO chapters (title, episode_no, webtoon_url, image_url, sort_order) VALUES (?, ?, ?, ?, ?) RETURNING *',
    args: [title, episode_no || null, webtoon_url || null, image_url || null, sort_order || 0],
  });

  return NextResponse.json(result.rows[0], { status: 201 });
}
