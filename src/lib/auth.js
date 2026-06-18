import NextAuth from 'next-auth';
import Discord from 'next-auth/providers/discord';
import { db } from '@/lib/db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      try {
        const result = await db.execute({
          sql: 'SELECT id FROM admins WHERE discord_id = ?',
          args: [profile.id],
        });
        return result.rows.length > 0;
      } catch {
        return false;
      }
    },
    async jwt({ token, profile }) {
      if (profile) token.discordId = profile.id;
      return token;
    },
    async session({ session, token }) {
      if (token?.discordId) session.user.discordId = token.discordId;
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
});
