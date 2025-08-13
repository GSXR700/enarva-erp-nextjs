// app/administration/support/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { TicketSAVStatus, TicketStatus, TicketPriority } from "@prisma/client";

// --- SAV Ticket Actions ---

interface SaveSavTicketData {
    id?: string;
    clientId: string;
    missionId: string;
    raison: string;
    description: string;
    statut: TicketSAVStatus;
}

export async function saveSavTicket(data: SaveSavTicketData) {
    try {
        const ticketNumber = `SAV-${Date.now().toString().slice(-6)}`;
        if (data.id) {
            // Update logic
            await prisma.ticketSAV.update({
                where: { id: data.id },
                data: {
                    raison: data.raison,
                    description: data.description,
                    statut: data.statut,
                }
            });
        } else {
            // Create logic
            await prisma.ticketSAV.create({
                data: {
                    ticketNumber,
                    clientId: data.clientId,
                    missionId: data.missionId,
                    raison: data.raison,
                    description: data.description,
                    statut: TicketSAVStatus.OUVERT,
                }
            });
        }
        revalidatePath("/administration/support");
        return { success: true };
    } catch (error) {
        console.error("Erreur lors de la sauvegarde du ticket SAV:", error);
        return { success: false, error: "Une erreur est survenue." };
    }
}


// --- Maintenance Ticket Actions ---

interface SaveMaintenanceTicketData {
    id?: string;
    equipmentId: string;
    reportedById: string; // Employee ID
    description: string;
    priority: TicketPriority;
    status: TicketStatus;
}

export async function saveMaintenanceTicket(data: SaveMaintenanceTicketData) {
    try {
        const ticketNumber = `MAINT-${Date.now().toString().slice(-6)}`;

        if (data.id) {
            // Update logic
            await prisma.maintenanceTicket.update({
                where: { id: data.id },
                data: {
                    description: data.description,
                    priority: data.priority,
                    status: data.status,
                }
            });
        } else {
            // Create logic
            await prisma.maintenanceTicket.create({
                data: {
                    ticketNumber,
                    equipmentId: data.equipmentId,
                    reportedById: data.reportedById,
                    description: data.description,
                    priority: data.priority,
                    status: TicketStatus.OPEN,
                }
            });
        }
        revalidatePath("/administration/support");
        return { success: true };
    } catch (error) {
        console.error("Erreur lors de la sauvegarde du ticket de maintenance:", error);
        return { success: false, error: "Une erreur est survenue." };
    }
}