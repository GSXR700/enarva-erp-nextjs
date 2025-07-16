// app/api/leads/[leadId]/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

// ========================================================
// METTRE À JOUR UN LEAD (PATCH) - v4.0
// ========================================================
export async function PATCH(
  req: Request,
  { params }: { params: { leadId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return new NextResponse("Accès non autorisé", { status: 403 });
    }

    const body = await req.json();
    // On utilise les nouveaux champs de notre schéma v4.0
    const { nom, email, telephone, canal, type, statut, source, commentaire, assignedToId } = body;

    if (!params.leadId) {
      return new NextResponse("ID du prospect manquant", { status: 400 });
    }

    if (!nom) {
        return new NextResponse("Le nom du contact est obligatoire", { status: 400 });
    }

    const updatedLead = await prisma.lead.update({
      where: { id: params.leadId },
      data: {
        nom,
        email,
        telephone,
        canal,
        type,
        statut,
        source,
        commentaire,
        assignedToId,
      },
    });

    return NextResponse.json(updatedLead);

  } catch (error) {
    console.error("[LEAD_PATCH_ERROR]", error);
    return new NextResponse("Erreur Interne du Serveur", { status: 500 });
  }
}

// ========================================================
// SUPPRIMER UN LEAD (DELETE) - v4.0
// ========================================================
export async function DELETE(
  req: Request,
  { params }: { params: { leadId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return new NextResponse("Accès non autorisé", { status: 403 });
    }

    if (!params.leadId) {
      return new NextResponse("ID du prospect manquant", { status: 400 });
    }

    // Avant de supprimer, on pourrait ajouter une logique pour vérifier 
    // si le lead est déjà converti ou lié à d'autres éléments.
    // Pour l'instant, nous faisons une suppression directe.

    await prisma.lead.delete({
      where: { id: params.leadId },
    });

    return new NextResponse("Prospect supprimé avec succès", { status: 200 });

  } catch (error) {
    console.error("[LEAD_DELETE_ERROR]", error);
    return new NextResponse("Erreur Interne du Serveur", { status: 500 });
  }
}