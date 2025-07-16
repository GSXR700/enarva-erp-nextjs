// middleware.ts
import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(request: NextRequestWithAuth) {
        const { token } = request.nextauth;
        const { pathname } = request.nextUrl;

        // Si un employé de terrain essaie d'accéder à l'admin, on le redirige
        if (pathname.startsWith('/administration') && token?.role === 'FIELD_WORKER') {
            return NextResponse.redirect(new URL('/mobile', request.url));
        }

        // Si un admin essaie d'accéder à l'app mobile, on le redirige
        if (pathname.startsWith('/mobile') && token?.role === 'ADMIN') {
            return NextResponse.redirect(new URL('/administration', request.url));
        }
    },
    {
        callbacks: {
            // Renvoie true si le token existe (utilisateur connecté)
            authorized: ({ token }) => !!token
        },
        pages: {
            signIn: "/login", // Page de connexion
        },
    }
);

// Le matcher spécifie que ce middleware s'applique à ces routes
export const config = {
  matcher: ["/administration/:path*", "/mobile"],
};