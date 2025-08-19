import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

/**
 * GET /api/leads/[id] - Récupérer un lead spécifique
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
      include: {
        assignedTo: {
          select: { name: true, image: true }
        },
        subcontractorAsSource: {
          select: { name: true }
        }
      },
    });

    if (!lead) {
      return new NextResponse("Prospect non trouvé", { status: 404 });
    }

    return NextResponse.json(lead);

  } catch (error) {
    console.error("[LEAD_GET_ERROR]", error);
    return new NextResponse("Erreur Interne du Serveur", { status: 500 });
  }
}

/**
 * PATCH /api/leads/[id] - Mettre à jour un lead
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
    const {
        nom, email, telephone, canal, type, statut, source, commentaire, quoteObject,
        assignedToId, subcontractorAsSourceId, date_intervention, date_cloture
    } = body;

    if (!nom) {
        return new NextResponse("Le nom du contact est obligatoire", { status: 400 });
    }

    // Prisma mettra à jour `date_derniere_action` automatiquement
    const dataToUpdate = {
        nom,
        email: email || null,
        telephone: telephone || null,
        canal,
        type,
        statut,
        source,
        commentaire: commentaire || null,
        quoteObject: quoteObject || null,
        assignedToId: assignedToId || null,
        subcontractorAsSourceId: subcontractorAsSourceId || null,
        date_intervention: date_intervention ? new Date(date_intervention) : null,
        date_cloture: date_cloture ? new Date(date_cloture) : null,
    };

    const updatedLead = await prisma.lead.update({
      where: { id: params.id },
      data: dataToUpdate,
      include: {
        assignedTo: {
          select: { name: true, image: true }
        },
        subcontractorAsSource: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json(updatedLead);

  } catch (error) {
    console.error("[LEAD_PATCH_ERROR]", error);
    const errorMessage = error instanceof Error ? error.message : "Erreur Interne du Serveur";
    return new NextResponse(errorMessage, { status: 500 });
  }
}

/**
 * DELETE /api/leads/[id] - Supprimer un lead
 */
export async function DELETE(
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

    const existingLead = await prisma.lead.findUnique({
      where: { id: params.id }
    });

    if (!existingLead) {
      return new NextResponse("Prospect non trouvé", { status: 404 });
    }

    await prisma.lead.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ 
      message: "Prospect supprimé avec succès",
      deletedId: params.id 
    });

  } catch (error) {
    console.error("[LEAD_DELETE_ERROR]", error);
    return new NextResponse("Erreur Interne du Serveur", { status: 500 });
  }
}