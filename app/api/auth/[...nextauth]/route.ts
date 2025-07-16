// app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

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

        // Retourner l'objet utilisateur complet, y compris l'image
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image, // <-- AJOUT IMPORTANT
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // Le callback "jwt" est appelé pour créer/mettre à jour le jeton de session
    async jwt({ token, user, trigger, session }) {
      // Si c'est une mise à jour (depuis le composant client)
      if (trigger === "update" && session?.image) {
        token.picture = session.image;
      }
      // Si c'est la connexion initiale
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.picture = user.image; // Stocker l'image dans le jeton
      }
      return token;
    },
    // Le callback "session" est appelé pour construire l'objet session côté client
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as Role;
        session.user.id = token.id as string;
        session.user.image = token.picture as string | null; // Passer l'image du jeton à la session
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

// Déclarations de types pour étendre la session
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
        image?: string | null; // Assurer que le type User inclut l'image
    }
}
declare module "next-auth/jwt" {
    interface JWT {
        role: Role;
        picture?: string | null; // Utiliser "picture" qui est un champ standard
    }
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };