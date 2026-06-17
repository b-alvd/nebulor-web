import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const categorySlug = searchParams.get('category');

  let entries;
  if (categorySlug) {
    entries = await db.execute({
      sql: `SELECT e.*, c.slug as category_slug, c.label as category_label
            FROM entries e
            JOIN categories c ON e.category_id = c.id
            WHERE c.slug = ?
            ORDER BY e.sort_order, e.name`,
      args: [categorySlug],
    });
  } else {
    entries = await db.execute({
      sql: `SELECT e.*, c.slug as category_slug, c.label as category_label
            FROM entries e
            JOIN categories c ON e.category_id = c.id
            ORDER BY c.sort_order, e.sort_order, e.name`,
      args: [],
    });
  }

  const result = await Promise.all(entries.rows.map(async (entry) => {
    const fields = await db.execute({
      sql: 'SELECT key, value FROM entry_fields WHERE entry_id = ?',
      args: [entry.id],
    });
    return {
      ...entry,
      fields: Object.fromEntries(fields.rows.map(f => [f.key, f.value])),
    };
  }));

  return NextResponse.json(result);
}

export async function POST(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { category_id, name, image_url, sort_order, fields } = body;

  const entry = await db.execute({
    sql: 'INSERT INTO entries (category_id, name, image_url, sort_order) VALUES (?, ?, ?, ?) RETURNING *',
    args: [category_id, name, image_url || null, sort_order || 0],
  });

  const entryId = entry.rows[0].id;

  if (fields && Object.keys(fields).length > 0) {
    for (const [key, value] of Object.entries(fields)) {
      if (value) {
        await db.execute({
          sql: 'INSERT INTO entry_fields (entry_id, key, value) VALUES (?, ?, ?)',
          args: [entryId, key, value],
        });
      }
    }
  }

  return NextResponse.json({ id: entryId, ...entry.rows[0] }, { status: 201 });
}
