import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getForumSession } from '@/lib/forum-session';

export async function POST(request) {
  const session = await getForumSession();
  if (!session) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

  const form = await request.formData();
  const file = form.get('file');
  if (!file || typeof file === 'string') return NextResponse.json({ error: 'Fichier requis' }, { status: 400 });

  if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Fichier image requis' }, { status: 400 });
  if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: 'Fichier trop volumineux (max 8 Mo)' }, { status: 400 });

  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `forum/${session.discordId}-${Date.now()}.${ext}`;
  const blob = await put(filename, file, { access: 'public' });

  return NextResponse.json({ url: blob.url });
}
