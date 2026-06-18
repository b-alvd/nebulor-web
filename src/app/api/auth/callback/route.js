import { NextResponse } from 'next/server';
import { exchangeCode, fetchDiscordUser } from '@/lib/discord';
import { createSession } from '@/lib/session';
import { db } from '@/lib/db';

export async function GET(request) {
  try {
    const code = new URL(request.url).searchParams.get('code');
    if (!code) return NextResponse.redirect(new URL('/admin/login', request.url));

    const tokenData = await exchangeCode(code);
    const discordUser = await fetchDiscordUser(tokenData.access_token);

    // Vérifie que c'est un admin
    const admin = await db.execute({
      sql: 'SELECT id FROM admins WHERE discord_id = ?',
      args: [String(discordUser.id)],
    });

    if (admin.rows.length === 0) {
      return NextResponse.redirect(new URL('/admin/login?error=unauthorized', request.url));
    }

    await createSession(String(discordUser.id), discordUser.username);
    return NextResponse.redirect(new URL('/admin', request.url));
  } catch (e) {
    console.error('Auth callback error:', e);
    return NextResponse.redirect(new URL('/admin/login?error=true', request.url));
  }
}
