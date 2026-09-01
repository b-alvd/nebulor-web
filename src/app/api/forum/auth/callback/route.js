import { NextResponse } from 'next/server';
import { exchangeCode, fetchDiscordUser } from '@/lib/discord';
import { createForumSession, initForumTables } from '@/lib/forum-session';

export async function GET(request) {
  try {
    const code = new URL(request.url).searchParams.get('code');
    if (!code) return NextResponse.redirect(new URL('/forum?error=true', request.url));

    const tokenData = await exchangeCode(code, process.env.DISCORD_FORUM_REDIRECT_URI);
    const discordUser = await fetchDiscordUser(tokenData.access_token);

    await initForumTables();
    await createForumSession(
      String(discordUser.id),
      discordUser.username ?? discordUser.global_name ?? 'Anonyme',
      discordUser.avatar ?? null,
    );

    return NextResponse.redirect(new URL('/forum', request.url));
  } catch (e) {
    console.error('Forum auth error:', e);
    return NextResponse.redirect(new URL('/forum?error=true', request.url));
  }
}
