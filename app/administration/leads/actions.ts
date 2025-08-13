// app/administration/leads/actions.ts

"use server";

import prisma from "@/lib/prisma";
import { unstable_noStore as noStore } from 'next/cache';
import { LeadStatus } from "@prisma/client";
import { revalidatePath } from "next/cache"; // <-- FIX: Added the missing import

// This function fetches all leads for the main list/kanban view.
export async function getLeads(page: number = 1) {
  noStore();
  const ITEMS_PER_PAGE = 10;
  try {
    const skip = (page - 1) * ITEMS_PER_PAGE;
    const [data, total] = await prisma.$transaction([
      prisma.lead.findMany({
        skip,
        take: ITEMS_PER_PAGE,
        include: {
          assignedTo: {
            select: { name: true, image: true },
          },
          subcontractorAsSource: {
            select: { name: true }
          }
        },
        orderBy: {
          date_creation: "desc",
        },
      }),
      prisma.lead.count(),
    ]);

    return {
        data: JSON.parse(JSON.stringify(data)),
        total,
        hasNextPage: (page * ITEMS_PER_PAGE) < total,
        hasPrevPage: page > 1,
    };

  } catch (error) {
    console.error("Échec de la récupération des leads:", error);
    return { data: [], total: 0, hasNextPage: false, hasPrevPage: false };
  }
}

// This function gets all data needed to populate the lead creation/edit form dropdowns.
export async function getLeadFormData() {
    noStore();
    try {
        const [users, subcontractors] = await Promise.all([
            prisma.user.findMany({
                where: {
                    role: { in: ['ADMIN', 'MANAGER', 'FIELD_WORKER'] }
                },
                select: { id: true, name: true }
            }),
            prisma.subcontractor.findMany({
                select: { id: true, name: true }
            })
        ]);
        return {
            users: JSON.parse(JSON.stringify(users)),
            subcontractors: JSON.parse(JSON.stringify(subcontractors))
        };
    } catch (error) {
        console.error("Échec de la récupération des données du formulaire de prospect:", error);
        return { users: [], subcontractors: [] };
    }
}


// This function updates the status of a lead, e.g., from the Kanban board or StatusSelector.
export async function updateLeadStatus(leadId: string, newStatus: LeadStatus) {
    if (!leadId || !newStatus) {
        return { success: false, error: "ID du prospect ou nouveau statut manquant." };
    }

    try {
        await prisma.lead.update({
            where: { id: leadId },
            data: { statut: newStatus },
        });

        revalidatePath("/administration/leads");

        return { success: true };
    } catch (error) {
        console.error("Erreur lors de la mise à jour du statut du prospect:", error);
        return { success: false, error: "Une erreur est survenue sur le serveur." };
    }
}