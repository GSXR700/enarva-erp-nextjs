// app/api/leads/[leadId]/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

// --- UPDATE A LEAD (PATCH) ---
export async function PATCH(
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

    const body = await req.json();
    const {
        nom, email, telephone, canal, type, statut, source, commentaire, quoteObject,
        assignedToId, subcontractorAsSourceId, date_intervention, date_cloture
    } = body;


    if (!nom) {
        return new NextResponse("Le nom du contact est obligatoire", { status: 400 });
    }

    const dataToUpdate = {
        nom,
        email,
        telephone,
        canal,
        type,
        statut,
        source,
        commentaire,
        quoteObject,
        assignedToId: assignedToId || null,
        subcontractorAsSourceId: subcontractorAsSourceId || null,
        date_intervention: date_intervention ? new Date(date_intervention) : null,
        date_cloture: date_cloture ? new Date(date_cloture) : null,
    };

    const updatedLead = await prisma.lead.update({
      where: { id: params.leadId },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedLead);

  } catch (error) {
    console.error("[LEAD_PATCH_ERROR]", error);
    const errorMessage = error instanceof Error ? error.message : "Erreur Interne du Serveur";
    return new NextResponse(errorMessage, { status: 500 });
  }
}

// --- DELETE A LEAD (DELETE) ---
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

    await prisma.lead.delete({
      where: { id: params.leadId },
    });

    return new NextResponse("Prospect supprimé avec succès", { status: 200 });

  } catch (error) {
    console.error("[LEAD_DELETE_ERROR]", error);
    return new NextResponse("Erreur Interne du Serveur", { status: 500 });
  }
}