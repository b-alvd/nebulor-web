import { getSession } from '@/lib/session';
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const formData = await req.formData();
  const file = formData.get('file');
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });
  const bytes = await file.arrayBuffer();
  const dir = join(process.cwd(), 'public', 'uploads');
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
  const ext = file.name.split('.').pop();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  await writeFile(join(dir, filename), Buffer.from(bytes));
  return NextResponse.json({ url: `/uploads/${filename}` });
}
