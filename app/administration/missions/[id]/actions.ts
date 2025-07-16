// enarva-nextjs-dashboard-app/app/administration/missions/[id]/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { createAndEmitNotification } from "@/lib/notificationService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Logique de numérotation qui utilise les bons noms de champs
async function getNextInvoiceAndDeliveryNoteNumbers() {
    const [allInvoices, allDeliveryNotes] = await Promise.all([
        prisma.invoice.findMany({ select: { invoiceNumber: true } }),
        prisma.deliveryNote.findMany({ select: { deliveryNoteNumber: true } })
    ]);

    const findMaxSerial = (docs: any[], key: string) => {
        return docs.reduce((max, doc) => {
            const fullNumber = doc[key] as string;
            if (!fullNumber) return max;
            const match = fullNumber.match(/\d+/);
            if (!match) return max;
            const num = parseInt(match[0], 10);
            return num > max ? num : max;
        }, 0);
    };
    
    const year = new Date().getFullYear();
    const nextInvoiceNum = Math.max(findMaxSerial(allInvoices, 'invoiceNumber'), 35) + 1;
    const nextDeliveryNum = Math.max(findMaxSerial(allDeliveryNotes, 'deliveryNoteNumber'), 99) + 1;

    return {
        invoiceNumber: `N ° ${String(nextInvoiceNum)}/${year}`,
        deliveryNoteNumber: `BL-${String(nextDeliveryNum)}/${year}`,
    };
}

export async function validateMission(missionId: string, orderId: string) {
    const session = await getServerSession(authOptions);

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { client: true }
    });

    if (!order) {
        throw new Error("Commande associée à la mission introuvable.");
    }
    
    const existingInvoice = await prisma.invoice.findFirst({ where: { orderId: order.id }});
    if (existingInvoice) {
        await prisma.mission.update({ where: { id: missionId }, data: { status: 'VALIDATED' } });
        revalidatePath(`/administration/missions/${missionId}`);
        return { success: true };
    }

    try {
        const { invoiceNumber, deliveryNoteNumber } = await getNextInvoiceAndDeliveryNoteNumbers();
        const now = new Date();
        const itemsAsJsonArray = order.items as Prisma.JsonArray;
        
        // CORRECTION : On définit les variables totalHT, tva, et totalTTC
        const totalTTC = order.totalTTC;
        const totalHT = totalTTC / 1.2;
        const tva = totalTTC - totalHT;

        await prisma.$transaction(async (tx) => {
            await tx.invoice.create({
                data: {
                    invoiceNumber,
                    date: now,
                    dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
                    status: 'DRAFT',
                    orderId: order.id,
                    clientId: order.clientId,
                    items: itemsAsJsonArray,
                    totalHT, 
                    tva, 
                    totalTTC, // Maintenant, cette variable existe
                }
            });

            await tx.deliveryNote.create({
                data: {
                    deliveryNoteNumber,
                    date: now,
                    orderId: order.id,
                    items: (itemsAsJsonArray as any[]).map(item => ({
                        designation: item.designation,
                        qteCommandee: item.quantity,
                        qteLivree: item.quantity,
                    })) as Prisma.JsonArray,
                }
            });
            
            await tx.mission.update({ where: { id: missionId }, data: { status: 'VALIDATED' } });
            await tx.order.update({ where: { id: orderId }, data: { status: 'DELIVERED' } });
        });

        if (session?.user?.id) {
            await createAndEmitNotification({
                userId: session.user.id,
                message: `Documents générés pour la commande ${order.orderNumber}.`,
                link: `/administration/invoices`
            });
        }

    } catch (error) {
        console.error("Erreur lors de la validation de la mission:", error);
        return { success: false, error: "Erreur lors de la génération des documents." };
    }

    revalidatePath(`/administration/missions/${missionId}`);
    revalidatePath('/administration/invoices');
    revalidatePath('/administration/delivery-notes');
    redirect(`/administration/invoices`);
}