// app/api/leads/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

// ========================================================
// CRÉER UN NOUVEAU LEAD (POST) - v4.0
// ========================================================
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return new NextResponse("Accès non autorisé", { status: 403 });
    }

    const body = await req.json();
    // On utilise les nouveaux noms de champs
    const { nom, email, telephone, canal, type, source, commentaire } = body;

    if (!nom) {
      return new NextResponse("Le nom du contact est obligatoire", { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: {
        nom,
        email,
        telephone,
        canal,
        type,
        source,
        commentaire,
        // Les autres champs comme le statut ont des valeurs par défaut
      },
    });

    return NextResponse.json(lead);

  } catch (error) {
    console.error("[LEADS_POST_ERROR]", error);
    return new NextResponse("Erreur Interne du Serveur", { status: 500 });
  }
}

// ========================================================
// RÉCUPÉRER LA LISTE DES LEADS (GET) - v4.0
// ========================================================
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Accès non autorisé", { status: 403 });
        }

        const leads = await prisma.lead.findMany({
            include: {
                assignedTo: {
                    select: {
                        name: true,
                        image: true,
                    }
                }
            },
            orderBy: {
                date_creation: 'desc'
            }
        });

        return NextResponse.json(leads);

    } catch (error) {
        console.error("[LEADS_GET_ERROR]", error);
        return new NextResponse("Erreur Interne du Serveur", { status: 500 });
    }
}