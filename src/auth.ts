import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { Provider } from "next-auth/providers";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { signInSchema } from "@/lib/validation";

declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"];
  }
}

export const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

const providers: Provider[] = [
  Credentials({
    credentials: { email: {}, password: {} },
    async authorize(raw) {
      const parsed = signInSchema.safeParse(raw);
      if (!parsed.success) return null;
      const { email, password } = parsed.data;
      const user = await getDb().query.users.findFirst({ where: eq(schema.users.email, email) });
      if (!user?.passwordHash) return null;
      if (!(await bcrypt.compare(password, user.passwordHash))) return null;
      return { id: user.id, name: user.name, email: user.email, image: user.image };
    },
  }),
];

if (googleEnabled) providers.push(Google);

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in" },
  providers,
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      if (trigger === "update" && typeof session?.name === "string") token.name = session.name.slice(0, 80);
      if (account?.provider === "google" && user?.email) {
        // Link Google sign-ins to a row in our users table (create on first visit).
        const db = getDb();
        const email = user.email.toLowerCase();
        let row = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
        if (!row) {
          [row] = db
            .insert(schema.users)
            .values({ email, name: user.name ?? email.split("@")[0], image: user.image, provider: "google" })
            .returning()
            .all();
        }
        token.uid = row.id;
        token.name = row.name;
      } else if (user?.id) {
        token.uid = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (typeof token.uid === "string") session.user.id = token.uid;
      if (token.name) session.user.name = token.name;
      return session;
    },
  },
});
