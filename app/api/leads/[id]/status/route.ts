// app/api/leads/[leadId]/status/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { LeadStatus } from "@prisma/client";

export async function PATCH(
  req: Request,
  { params }: { params: { leadId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return new NextResponse("Accès non autorisé", { status: 403 });
    }

    const { status } = (await req.json()) as { status: LeadStatus };

    if (!status || !Object.values(LeadStatus).includes(status)) {
      return new NextResponse("Le nouveau statut est invalide ou manquant", { status: 400 });
    }

    const updatedLead = await prisma.lead.update({
      where: { id: params.leadId },
      data: { statut: status },
    });

    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error("[LEAD_STATUS_PATCH_ERROR]", error);
    return new NextResponse("Erreur Interne du Serveur", { status: 500 });
  }
}