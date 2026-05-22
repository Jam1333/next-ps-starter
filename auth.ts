import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const signInSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(80).optional()
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/auth/signin"
  },
  providers: [
    Credentials({
      name: "Demo login",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Name", type: "text" }
      },
      async authorize(credentials) {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, name } = parsed.data;
        const user = await prisma.user.upsert({
          where: { email },
          update: { name: name ?? undefined },
          create: {
            email,
            name: name ?? email.split("@")[0]
          }
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) session.user.id = token.id as string;
      if (session.user && token.email) session.user.email = token.email;
      if (session.user && token.name) session.user.name = token.name;
      return session;
    }
  }
});
