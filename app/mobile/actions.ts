// enarva-nextjs-dashboard-app/app/mobile/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { ObservationType } from "@prisma/client";
// On importe l'action centralisée que nous venons de créer
import { punchTimesheet as punchTimesheetAction } from "@/app/administration/payroll/actions";

// Cette fonction devient une simple "passerelle" vers la vraie logique.
// Elle ne contient plus de logique métier.
export async function punchTimesheet(employeeId: string, missionId: string) {
    const mission = await prisma.mission.findUnique({ where: { id: missionId } });
    if (!mission) {
        return { success: false, error: "Mission introuvable." };
    }

    // Appelle la fonction centralisée
    return await punchTimesheetAction(employeeId, missionId);
}


// Action pour sauvegarder l'observation (inchangée)
export async function saveObservation(data: {
    missionId: string;
    content: string;
    url: string;
}) {
    try {
        await prisma.observation.create({
            data: {
                missionId: data.missionId,
                content: data.content,
                mediaUrl: data.url,
                type: ObservationType.INFO,
            }
        });
        return { success: true };
    } catch (error) {
        console.error("Erreur lors de la sauvegarde de l'observation:", error);
        return { success: false, error: "Impossible d'enregistrer en base de données." };
    }
}