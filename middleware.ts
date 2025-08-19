import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req });
    const isAuthenticated = !!token;
    const userRole = token?.role as Role;

    const { pathname } = req.nextUrl;

    // Si l'utilisateur est authentifié
    if (isAuthenticated) {
      // Si un utilisateur NON employé tente d'accéder à la page mobile,
      // on le redirige vers sa page d'administration.
      if (pathname.startsWith("/mobile") && userRole !== Role.FIELD_WORKER) {
        return NextResponse.redirect(new URL("/administration", req.url));
      }

      // Si un employé tente d'accéder à l'administration,
      // on le redirige vers sa page mobile.
      if (pathname.startsWith("/administration") && userRole === Role.FIELD_WORKER) {
        return NextResponse.redirect(new URL("/mobile", req.url));
      }

      // Si un utilisateur authentifié tente d'accéder à la page de connexion,
      // on le redirige vers la page appropriée en fonction de son rôle.
      if (pathname.startsWith("/login")) {
        const redirectUrl = userRole === Role.FIELD_WORKER ? "/mobile" : "/administration";
        return NextResponse.redirect(new URL(redirectUrl, req.url));
      }
    }

    // Si l'utilisateur n'est pas authentifié et tente d'accéder à une page protégée
    if (!isAuthenticated && (pathname.startsWith("/administration") || pathname.startsWith("/mobile"))) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // Le middleware s'exécute sur chaque requête
    },
  }
);

export const config = {
  matcher: ["/administration/:path*", "/mobile/:path*", "/login"],
};