import { getSession } from '@/lib/session';
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file');
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  const blob = await put(file.name, file, { access: 'public' });
  return NextResponse.json({ url: blob.url });
}
