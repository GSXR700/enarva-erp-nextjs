// app/api/leads/[id]/convert/route.ts
// 🔧 CORRECTION: Changer `leadId` en `id` pour correspondre à la route

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { LeadStatus } from "@prisma/client";
import { getNextQuoteNumber } from "@/app/administration/quotes/actions";

export async function POST(
  req: Request,
  { params }: { params: { id: string } } // 🔧 CORRECTION: Changé de `leadId` à `id`
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return new NextResponse("Accès non autorisé", { status: 403 });
    }

    if (!params.id) { // 🔧 CORRECTION: Changé de `params.leadId` à `params.id`
      return new NextResponse("ID du prospect manquant", { status: 400 });
    }

    const lead = await prisma.lead.findUnique({ where: { id: params.id } }); // 🔧 CORRECTION

    if (!lead) {
      return new NextResponse("Prospect non trouvé", { status: 404 });
    }

    if (lead.statut === LeadStatus.qualified) {
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
            type: 'ENTREPRISE', 
          },
        });
      }

      // 2. Mettre à jour le statut du lead et le lier au client
      await tx.lead.update({
        where: { id: lead.id },
        data: {
          statut: LeadStatus.qualified,
          converti_en_client: true,
          client_id: client.id,
        },
      });

      // 3. Utiliser la logique centralisée de numérotation
      const newQuoteNumber = await getNextQuoteNumber();

      // 4. Créer le devis
      const quote = await tx.quote.create({
        data: {
          quoteNumber: newQuoteNumber,
          object: lead.quoteObject ?? `Devis pour ${client.nom}`,
          clientId: client.id,
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