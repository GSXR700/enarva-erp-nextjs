import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { LeadStatus } from "@prisma/client";

/**
 * PATCH /api/leads/[id]/status - Mettre à jour uniquement le statut d'un lead
 * Cette route optimisée permet de changer rapidement le statut depuis le Kanban ou autres composants
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return new NextResponse("Accès non autorisé", { status: 403 });
    }

    if (!params.id) {
      return new NextResponse("ID du prospect manquant", { status: 400 });
    }

    const body = await req.json();
    const { status } = body as { status: LeadStatus };

    // Validation du statut
    if (!status || !Object.values(LeadStatus).includes(status)) {
      return new NextResponse("Le nouveau statut est invalide ou manquant", { status: 400 });
    }

    // Vérifier que le lead existe
    const existingLead = await prisma.lead.findUnique({
      where: { id: params.id },
      select: { id: true, statut: true, date_cloture: true } // On récupère aussi date_cloture pour la logique métier
    });

    if (!existingLead) {
      return new NextResponse("Prospect non trouvé", { status: 404 });
    }

    // Si le statut est identique, pas besoin de mise à jour
    if (existingLead.statut === status) {
      const currentLead = await prisma.lead.findUnique({ where: { id: params.id }});
      return NextResponse.json({ 
        message: "Statut déjà à jour", 
        lead: currentLead
      });
    }

    // Prisma mettra à jour `date_derniere_action` automatiquement grâce à @updatedAt
    const updateData: { statut: LeadStatus; date_cloture?: Date; converti_en_client?: boolean } = {
      statut: status,
    };

    // Si le statut implique que le lead est converti en client
    if (status === 'quote_accepted' || status === 'client_confirmed') {
        updateData.converti_en_client = true;
    }

    // Si le statut passe à un état de "clôture", on met à jour la date de clôture
    const closingStatuses: LeadStatus[] = ['quote_accepted', 'quote_refused', 'client_confirmed', 'lead_lost', 'canceled_by_client', 'canceled_by_enarva'];
    if (closingStatuses.includes(status) && !existingLead.date_cloture) {
      updateData.date_cloture = new Date();
    }

    const updatedLead = await prisma.lead.update({
      where: { id: params.id },
      data: updateData,
      include: {
        assignedTo: {
          select: { name: true, image: true }
        },
        subcontractorAsSource: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json({
      message: "Statut mis à jour avec succès",
      lead: updatedLead
    });

  } catch (error) {
    console.error("[LEAD_STATUS_PATCH_ERROR]", error);
    return new NextResponse("Erreur Interne du Serveur", { status: 500 });
  }
}

/**
 * GET /api/leads/[id]/status - Récupérer uniquement le statut d'un lead
 * Utile pour des vérifications rapides ou des mises à jour temps réel
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Accès non autorisé", { status: 401 });
    }

    if (!params.id) {
      return new NextResponse("ID du prospect manquant", { status: 400 });
    }

    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      select: { 
        id: true, 
        statut: true, 
        date_derniere_action: true, // Utilisation du bon champ
        date_cloture: true 
      }
    });

    if (!lead) {
      return new NextResponse("Prospect non trouvé", { status: 404 });
    }

    return NextResponse.json({
      id: lead.id,
      status: lead.statut,
      lastModified: lead.date_derniere_action, // Utilisation du bon champ
      closedAt: lead.date_cloture
    });

  } catch (error) {
    console.error("[LEAD_STATUS_GET_ERROR]", error);
    return new NextResponse("Erreur Interne du Serveur", { status: 500 });
  }
}