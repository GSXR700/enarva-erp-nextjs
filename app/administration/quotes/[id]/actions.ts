// contenu du fichier 

"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { createMissionsFromOrder } from "@/services/missionService"; // Import du service

// Logique de numérotation originale pour les Commandes
async function getNextOrderNumber(tx: Prisma.TransactionClient) {
    const allOrders = await tx.order.findMany({ select: { orderNumber: true } });
    let maxNumber = 0;
    allOrders.forEach(order => {
        if (order.orderNumber) {
            const match = order.orderNumber.match(/\d+/g);
            if (match) {
                const num = parseInt(match[0], 10);
                if (num > maxNumber) maxNumber = num;
            }
         }
    });
    const nextNumber = Math.max(maxNumber, 99) + 1;
    return `CMD-${String(nextNumber)}/${new Date().getFullYear()}`;
}

export async function createOrderFromQuote(formData: FormData) {
    const quoteId = formData.get("quoteId") as string;
    const refCommande = formData.get("refCommande") as string;
    const orderedBy = formData.get("orderedBy") as string;

    const quote = await prisma.quote.findUnique({
        where: { id: quoteId },
        include: { order: true }
    });

    if (!quote) return { success: false, error: "Devis introuvable." };
    if (quote.order) return { success: false, error: "Une commande existe déjà pour ce devis." };

    try {
        await prisma.$transaction(async (tx) => {
            const orderNumber = await getNextOrderNumber(tx);
            const now = new Date();
            const itemsAsJsonArray = quote.items as Prisma.JsonArray;
            
            // 1. Créer la commande
            const newOrder = await tx.order.create({
                data: {
                    orderNumber,
                    date: now,
                    status: 'PENDING',
                    quoteId: quote.id,
                    clientId: quote.clientId,
                    items: itemsAsJsonArray,
                    // CHANGEMENT: Aucune modification de code nécessaire ici.
                    // La valeur `quote.totalTTC` est déjà correcte car elle
                    // a été calculée en fonction du `juridicState` lors de
                    // la sauvegarde du devis. On la propage simplement.
                    totalTTC: quote.totalTTC,
                    refCommande: refCommande,
                    orderedBy: orderedBy,
                }
            });

            // 2. Mettre à jour le devis
            await tx.quote.update({
                where: { id: quoteId },
                data: { status: 'ACCEPTED' }
            });

            // 3. Appeler la création de la mission en passant la transaction
            await createMissionsFromOrder(newOrder, tx);
        });

    } catch (error) {
        console.error("Erreur lors de la transformation du devis:", error);
        return { success: false, error: "Erreur lors de la création de la commande et de la mission." };
    }

    revalidatePath('/administration/quotes');
    revalidatePath('/administration/missions');
    redirect(`/administration/missions`);
}