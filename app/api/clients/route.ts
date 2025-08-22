// app/api/clients/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

/**
 * POST /api/clients - Créer un nouveau client
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return new NextResponse("Accès non autorisé", { status: 403 });
    }

    const body = await req.json();
    const { nom, email, telephone, address, type, status } = body;

    if (!nom || !type) {
      return new NextResponse("Le nom et le type du client sont requis", { status: 400 });
    }

    // Vérifier si un client avec le même nom existe déjà
    const existingClient = await prisma.client.findFirst({
      where: { nom: nom }
    });

    if (existingClient) {
      return new NextResponse("Un client avec ce nom existe déjà", { status: 409 });
    }

    const newClient = await prisma.client.create({
      data: {
        nom,
        email: email || null,
        telephone: telephone || null,
        adresse: address || null,
        type,
        statut: status || 'ACTIF',
      },
    });

    return NextResponse.json(newClient, { status: 201 });

  } catch (error) {
    console.error("[CLIENTS_POST_ERROR]", error);
    return new NextResponse("Erreur Interne du Serveur", { status: 500 });
  }
}

/**
 * GET /api/clients - Récupérer la liste des clients
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Accès non autorisé", { status: 401 });
    }

    const clients = await prisma.client.findMany({
      orderBy: {
        date_entree: 'desc',
      },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("[CLIENTS_GET_ERROR]", error);
    return new NextResponse("Erreur Interne du Serveur", { status: 500 });
  }
}