import { AuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session?.image) {
        token.picture = session.image;
      }
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as Role;
        session.user.id = token.id as string;
        session.user.image = token.picture as string | null;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: '/login',
  },
};

// Fonctions utilitaires session
export async function getCurrentUser() {
    const session = await getServerSession(authOptions);
    return session?.user || null;
}

export async function requireAuth() {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Authentication required');
    }
    return user;
}

export async function requireRole(allowedRoles: string[]) {
    const user = await requireAuth();
    if (!allowedRoles.includes(user.role)) {
        throw new Error(`Access denied. Required roles: ${allowedRoles.join(', ')}`);
    }
    return user;
}

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: Role;
        } & {
            name?: string | null;
            email?: string | null;
            image?: string | null;
        };
    }
    interface User {
        role: Role;
        image?: string | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: Role;
        picture?: string | null;
    }
}