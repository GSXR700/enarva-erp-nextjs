import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

/**
 * POST /api/leads - Créer un nouveau prospect
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return new NextResponse("Accès non autorisé", { status: 403 });
    }

    const body = await req.json();
    const { 
        nom, telephone, email, canal, statut, type, source, 
        commentaire, assignedToId, quoteObject, date_intervention, date_cloture 
    } = body;

    if (!nom || !quoteObject) {
      return new NextResponse("Le nom et l'objet du devis sont requis", { status: 400 });
    }

    const newLead = await prisma.lead.create({
      data: {
        nom,
        telephone,
        email,
        canal,
        statut,
        type,
        source,
        commentaire,
        quoteObject,
        assignedToId,
        date_intervention: date_intervention ? new Date(date_intervention) : null,
        date_cloture: date_cloture ? new Date(date_cloture) : null,
      },
    });

    return NextResponse.json(newLead, { status: 201 });

  } catch (error) {
    console.error("[LEADS_POST_ERROR]", error);
    return new NextResponse("Erreur Interne du Serveur", { status: 500 });
  }
}

/**
 * GET /api/leads - Récupérer la liste des prospects (utilisé par la page principale)
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Accès non autorisé", { status: 401 });
    }

    // Cette route est bonne pour l'API, mais vos Server Actions gèrent déjà le fetch paginé.
    // Nous la gardons pour une utilisation API standard si besoin.
    const leads = await prisma.lead.findMany({
      orderBy: {
        date_creation: 'desc',
      },
      include: {
        assignedTo: {
          select: {
            name: true,
            image: true,
          }
        },
         subcontractorAsSource: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error("[LEADS_GET_ERROR]", error);
    return new NextResponse("Erreur Interne du Serveur", { status: 500 });
  }
}