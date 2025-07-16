// app/administration/missions/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { MissionStatus } from "@prisma/client";

// Define action response types for better type safety
type ActionResponse = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  data?: any;
};

// Improved schema with more validation and better error messages
const missionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères").optional(),
  orderId: z.string().min(1, "L'ID de commande est invalide").optional(),
  assignedToId: z.string()
    .min(1, "Un employé doit être assigné à la mission")
    .describe("Un employé doit être assigné à la mission"),
  scheduledStart: z.coerce.date()
    .refine(date => date > new Date(), "La date de début doit être dans le futur")
    .describe("La date de début est requise"),
  notes: z.string().max(1000, "Les notes ne peuvent pas dépasser 1000 caractères").optional(),
  status: z.nativeEnum(MissionStatus).optional(),
}).refine(
  data => (!!data.orderId && !data.title) || (!data.orderId && !!data.title),
  {
    message: "Vous devez spécifier soit une commande, soit un titre personnalisé, mais pas les deux",
    path: ["title"]
  }
);

export async function saveMission(formData: FormData): Promise<ActionResponse> {
  try {
    // Clean and prepare the data
    const rawData = Object.fromEntries(formData.entries());
    const cleanData = {
      ...rawData,
      orderId: rawData.orderId === "" ? undefined : rawData.orderId,
      title: rawData.title === "" ? undefined : rawData.title,
    };

    // Validate the data
    const validatedFields = missionSchema.safeParse(cleanData);
    if (!validatedFields.success) {
      return {
        success: false,
        message: 'Certains champs sont invalides.',
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { id, ...data } = validatedFields.data;

    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: data.assignedToId },
      include: { user: true }
    });

    if (!employee) {
      return {
        success: false,
        message: "L'employé sélectionné n'existe pas.",
        errors: { assignedToId: ["Employé non trouvé"] }
      };
    }

    // Check if order exists when orderId is provided
    if (data.orderId) {
      const order = await prisma.order.findUnique({
        where: { id: data.orderId }
      });

      if (!order) {
        return {
          success: false,
          message: "La commande sélectionnée n'existe pas.",
          errors: { orderId: ["Commande non trouvée"] }
        };
      }
    }

    // Prepare data for database
    const dataToSave = {
      ...data,
      title: data.orderId ? undefined : data.title,
      orderId: data.orderId || null,
      scheduledEnd: new Date(data.scheduledStart.getTime() + 8 * 60 * 60 * 1000)
    };

    // Save to database
    if (id) {
      const existingMission = await prisma.mission.findUnique({
        where: { id }
      });

      if (!existingMission) {
        return {
          success: false,
          message: "La mission à modifier n'existe pas.",
          errors: { id: ["Mission non trouvée"] }
        };
      }

      await prisma.mission.update({ 
        where: { id }, 
        data: dataToSave 
      });
    } else {
      await prisma.mission.create({ 
        data: { ...dataToSave, status: 'PENDING' as MissionStatus }
      });
    }

    // Revalidate pages
    revalidatePath("/administration/missions");
    revalidatePath("/administration/planning");

    return {
      success: true,
      message: `Mission ${id ? 'modifiée' : 'créée'} avec succès.`
    };

  } catch (error) {
    console.error("Erreur lors de l'enregistrement de la mission:", error);
    return {
      success: false,
      message: "Une erreur est survenue lors de l'enregistrement.",
      errors: {
        _form: ["Erreur de base de données. Veuillez réessayer."]
      }
    };
  }
}

export async function deleteMission(id: string): Promise<ActionResponse> {
    if (!id) {
        return {
            success: false,
            message: "L'identifiant de la mission est manquant.",
            errors: { id: ["Identifiant requis"] }
        };
    }

    try {
        // Check if mission exists and its current status
        const mission = await prisma.mission.findUnique({
            where: { id },
            include: {
                order: true,
                _count: {
                    select: {
                        observations: true
                    }
                }
            }
        });

        if (!mission) {
            return {
                success: false,
                message: "La mission n'existe pas.",
                errors: { id: ["Mission non trouvée"] }
            };
        }

        // Check if mission can be deleted
        if (mission.status === 'IN_PROGRESS') {
            return {
                success: false,
                message: "Impossible de supprimer une mission en cours.",
                errors: { status: ["La mission est en cours d'exécution"] }
            };
        }

        if (mission._count.observations > 0) {
            return {
                success: false,
                message: "Impossible de supprimer une mission avec des observations.",
                errors: { observations: ["La mission contient des observations"] }
            };
        }

        // Proceed with deletion
        await prisma.mission.delete({ where: { id } });

        // Revalidate paths
        revalidatePath("/administration/missions");
        revalidatePath("/administration/planning");

        return {
            success: true,
            message: "Mission supprimée avec succès."
        };

    } catch (error) {
        console.error("Erreur lors de la suppression de la mission:", error);
        return {
            success: false,
            message: "Une erreur est survenue lors de la suppression.",
            errors: {
                _form: ["Erreur de base de données. Veuillez réessayer."]
            }
        };
    }
}