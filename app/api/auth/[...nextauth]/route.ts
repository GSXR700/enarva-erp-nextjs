import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "@prisma/client";

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
        image?: string | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: Role;
        picture?: string | null;
    }
}

const handler = NextAuth(authOptions);

// CORRECTION CRITIQUE : Export authOptions pour l'utiliser dans d'autres API routes
export { handler as GET, handler as POST, authOptions };