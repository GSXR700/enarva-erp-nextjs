// app/mobile/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { ObservationType } from "@prisma/client";
import { punchTimesheet as punchTimesheetAction } from "@/app/administration/payroll/actions";
import { revalidatePath } from "next/cache";

export async function punchTimesheet(employeeId: string, missionId: string) {
    try {
        console.log(`🔍 Mobile punchTimesheet called: employee ${employeeId}, mission ${missionId}`);
        
        // Verify employee exists and is assigned to this mission
        const mission = await prisma.mission.findFirst({
            where: { 
                id: missionId,
                assignedToId: employeeId 
            },
            select: { 
                id: true, 
                status: true, 
                title: true,
                assignedToId: true 
            }
        });
        
        if (!mission) {
            console.log(`❌ Mission ${missionId} not found or not assigned to employee ${employeeId}`);
            return { 
                success: false, 
                error: "Mission introuvable ou non assignée à cet employé." 
            };
        }

        console.log(`📋 Mission ${missionId} status before punch: ${mission.status}`);

        // Call the centralized function
        const result = await punchTimesheetAction(employeeId, missionId);
        
        console.log(`⚡ punchTimesheetAction result:`, result);

        if (result.success) {
            // Force revalidation of the employee missions API and mobile pages
            revalidatePath(`/api/missions/employee/${employeeId}`);
            revalidatePath(`/mobile`);
            console.log(`🔄 Mobile paths revalidated for employee ${employeeId}`);
        }
        
        return result;
        
    } catch (error) {
        console.error("❌ Error in mobile punchTimesheet:", error);
        return { 
            success: false, 
            error: "Une erreur système est survenue." 
        };
    }
}

export async function saveObservation(data: {
    missionId: string;
    content: string;
    url: string;
}) {
    try {
        console.log(`📝 Saving observation for mission ${data.missionId}`);
        
        // Verify mission exists
        const mission = await prisma.mission.findUnique({
            where: { id: data.missionId },
            select: { id: true, title: true }
        });

        if (!mission) {
            console.log(`❌ Mission ${data.missionId} not found for observation`);
            return { 
                success: false, 
                error: "Mission introuvable." 
            };
        }

        await prisma.observation.create({
            data: {
                missionId: data.missionId,
                content: data.content,
                mediaUrl: data.url,
                type: ObservationType.INFO,
            }
        });

        // Revalidate relevant paths
        revalidatePath(`/administration/missions/${data.missionId}`);
        revalidatePath(`/mobile`);
        
        console.log(`✅ Observation saved for mission ${data.missionId}`);
        return { success: true };
        
    } catch (error) {
        console.error("❌ Error saving observation:", error);
        return { 
            success: false, 
            error: "Impossible d'enregistrer l'observation." 
        };
    }
}