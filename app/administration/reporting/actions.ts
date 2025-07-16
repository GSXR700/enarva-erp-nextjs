// enarva-nextjs-dashboard-app/app/administration/reporting/actions.ts
"use server";

import prisma from "@/lib/prisma";

export async function getFilteredInvoices(startDate: Date, endDate: Date) {
    if (!startDate || !endDate) {
        return { success: false, error: "Les dates sont requises.", data: [] };
    }

    try {
        const invoices = await prisma.invoice.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate,
                }
            },
            // CORRECTION : On inclut maintenant le client ET la commande
            include: { 
                client: true,
                order: true 
            },
            orderBy: { date: 'desc' }
        });
        return { success: true, data: invoices };
    } catch (error) {
        console.error("Erreur de filtrage des factures:", error);
        return { success: false, error: "Une erreur est survenue.", data: [] };
    }
}