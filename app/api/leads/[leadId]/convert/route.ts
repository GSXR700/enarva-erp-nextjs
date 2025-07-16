// app/api/leads/[leadId]/convert/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { LeadStatus } from "@prisma/client";

export async function POST(
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

    const lead = await prisma.lead.findUnique({ where: { id: params.leadId } });

    if (!lead) {
      return new NextResponse("Prospect non trouvé", { status: 404 });
    }

    if (lead.statut === LeadStatus.client_converted) {
      return new NextResponse("Ce prospect a déjà été converti", { status: 400 });
    }

    const newQuote = await prisma.$transaction(async (tx) => {
      // 1. Trouver ou créer le client
      let client = await tx.client.findFirst({
        where: { nom: lead.nom },
      });

      if (!client) {
        client = await tx.client.create({
          data: {
            nom: lead.nom,
            email: lead.email,
            telephone: lead.telephone,
            // Le champ `adresse` n'existe pas sur le modèle Lead dans votre schéma
            type: 'ENTREPRISE', // Vous pouvez adapter cette logique
          },
        });
      }

      // 2. Mettre à jour le statut du lead et le lier au client
      await tx.lead.update({
        where: { id: lead.id },
        data: {
          statut: LeadStatus.client_converted,
          converti_en_client: true,
          client_id: client.id, // On enregistre le lien vers le client
        },
      });

      // 3. Créer le numéro de devis
      const lastQuote = await tx.quote.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { quoteNumber: true }
      });
      const newQuoteNumber = lastQuote?.quoteNumber
        ? `QU-${(parseInt(lastQuote.quoteNumber.split('-')[1]) + 1).toString().padStart(5, '0')}`
        : 'QU-00001';

      // 4. Créer le devis et le lier UNIQUEMENT au client
      const quote = await tx.quote.create({
        data: {
          quoteNumber: newQuoteNumber,
          object: `Devis pour ${client.nom}`,
          clientId: client.id, // ** La seule liaison nécessaire **
          items: [],
          totalHT: 0,
          tva: 0,
          totalTTC: 0,
        },
      });

      return quote;
    });

    return NextResponse.json(newQuote);

  } catch (error) {
    console.error("[LEAD_CONVERT_ERROR]", error);
    return new NextResponse("Erreur Interne du Serveur", { status: 500 });
  }
}