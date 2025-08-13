// app/administration/quotes/actions.ts

"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma, JuridicState } from "@prisma/client";
import { quoteFormSchema } from "@/lib/validations";

export async function getQuoteForPdf(id: string) {
    if (!id) {
        throw new Error("ID du devis manquant.");
    }
    const quoteWithDetails = await prisma.quote.findUnique({
        where: { id },
        include: {
            client: true,
            prestation: true
        }
    });
    if (!quoteWithDetails) {
        throw new Error("Devis introuvable.");
    }
    return quoteWithDetails;
}

export async function getNextQuoteNumber() {
    const lastQuote = await prisma.quote.findFirst({
        orderBy: { createdAt: 'desc' },
        where: { quoteNumber: { startsWith: 'DV-' } }
    });

    let nextNumber = 102;

    if (lastQuote && lastQuote.quoteNumber) {
        const match = lastQuote.quoteNumber.match(/DV-(\d+)/);
        if (match && match[1]) {
            const lastNumber = parseInt(match[1], 10);
            nextNumber = Math.max(lastNumber + 1, 100);
        }
    }
    return `DV-${nextNumber}/${new Date().getFullYear()}`;
}


export async function saveQuote(formData: FormData) {
    const id = formData.get("id") as string;
    const rawFormData = Object.fromEntries(formData.entries());

    const validated = quoteFormSchema.safeParse(rawFormData);
    if (!validated.success) {
        console.error("Validation failed:", validated.error.flatten().fieldErrors);
        return { success: false, error: "Les données du formulaire sont invalides." };
    }

    const { data: quoteData } = validated;
    const items = JSON.parse(quoteData.items);

    const totalHT = items.reduce((sum: number, item: any) => sum + (parseFloat(item.total) || 0), 0);
    
    let tva = 0;
    let totalTTC = totalHT;
    if (quoteData.juridicState === 'LEGAL') {
        tva = totalHT * 0.20;
        totalTTC = totalHT + tva;
    }

    const dataToSave = {
        clientId: quoteData.clientId,
        date: new Date(quoteData.date),
        status: quoteData.status,
        object: quoteData.object,
        juridicState: quoteData.juridicState,
        items: items as Prisma.InputJsonValue,
        totalHT, 
        tva, 
        totalTTC,
    };

    const prestationData = {
        personnelMobilise: quoteData.personnelMobilise || null,
        equipementsUtilises: quoteData.equipementsUtilises || null,
        prestationsIncluses: quoteData.prestationsIncluses || null,
        delaiPrevu: quoteData.delaiPrevu || null,
    };

    try {
        if (id) {
            // Update existing quote - No change to quoteNumber
            await prisma.quote.update({
                where: { id },
                data: {
                    ...dataToSave,
                    prestation: {
                        upsert: {
                            create: prestationData,
                            update: prestationData,
                        }
                    }
                }
            });
        } else {
            // Create new quote - Generate a new quoteNumber
            const quoteNumber = await getNextQuoteNumber();
            await prisma.quote.create({
                data: {
                    ...dataToSave,
                    quoteNumber: quoteNumber, // Assign the new number here
                    prestation: {
                        create: prestationData
                    }
                }
            });
        }
    } catch (error) {
        console.error("Erreur lors de la sauvegarde du devis:", error);
        return { success: false, error: "Une erreur est survenue sur le serveur." };
    }

    revalidatePath("/administration/quotes");
    redirect("/administration/quotes");
}

export async function deleteQuote(id: string) {
    if (!id) return { success: false, error: "ID manquant." };
    try {
        const existingOrder = await prisma.order.findFirst({ where: { quoteId: id } });
        if (existingOrder) return { success: false, error: "Impossible de supprimer ce devis car il a déjà été accepté." };
        
        await prisma.prestation.deleteMany({ where: { quoteId: id } });
        await prisma.quote.delete({ where: { id } });
        
        revalidatePath("/administration/quotes");
        return { success: true };
    } catch (error) {
        console.error(error);
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return { success: false, error: "Le devis que vous essayez de supprimer n'existe pas." };
        }
        return { success: false, error: "Erreur lors de la suppression." };
    }
}