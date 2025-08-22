// app/administration/equipment/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { EquipmentStatus } from "@prisma/client";

type ActionResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

export async function saveEquipment(formData: FormData): Promise<ActionResponse> {
  try {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const serialNumber = formData.get("serialNumber") as string || null;
    const purchaseDate = formData.get("purchaseDate") as string;
    const status = formData.get("status") as EquipmentStatus || 'IN_SERVICE';

    if (!name || !type) {
      return { success: false, error: "Le nom et le type sont requis." };
    }

    // Vérifier les doublons pour les nouveaux équipements
    if (!id) {
      const existingName = await prisma.equipment.findFirst({
        where: { name }
      });

      if (existingName) {
        return { success: false, error: "Un équipement avec ce nom existe déjà." };
      }

      if (serialNumber) {
        const existingSerial = await prisma.equipment.findFirst({
          where: { serialNumber }
        });

        if (existingSerial) {
          return { success: false, error: "Un équipement avec ce numéro de série existe déjà." };
        }
      }
    }

    const data = {
      name,
      type,
      serialNumber,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
      status,
    };

    if (id) {
      // Mise à jour
      await prisma.equipment.update({ 
        where: { id }, 
        data 
      });
    } else {
      // Création
      await prisma.equipment.create({ data });
    }
    
    revalidatePath("/administration/equipments");
    return { success: true, message: `Équipement ${id ? 'modifié' : 'créé'} avec succès.` };

  } catch (error) {
    console.error("Erreur saveEquipment:", error);
    return { success: false, error: "Une erreur est survenue lors de la sauvegarde." };
  }
}

export async function deleteEquipment(id: string): Promise<ActionResponse> {
  if (!id) {
    return { success: false, error: "ID manquant." };
  }

  try {
    // Vérifier si l'équipement a des tickets de maintenance
    const equipment = await prisma.equipment.findUnique({
      where: { id },
      include: {
        _count: {
          select: { tickets: true }
        }
      }
    });

    if (!equipment) {
      return { success: false, error: "Équipement non trouvé." };
    }

    if (equipment._count.tickets > 0) {
      return { 
        success: false, 
        error: "Impossible de supprimer cet équipement car il a des tickets de maintenance associés." 
      };
    }

    await prisma.equipment.delete({ where: { id } });
    revalidatePath("/administration/equipments");
    return { success: true, message: "Équipement supprimé avec succès." };

  } catch (error) {
    console.error("Erreur deleteEquipment:", error);
    return { success: false, error: "Une erreur est survenue lors de la suppression." };
  }
}

export async function updateEquipmentStatus(id: string, status: EquipmentStatus): Promise<ActionResponse> {
  if (!id || !status) {
    return { success: false, error: "Données manquantes." };
  }

  try {
    await prisma.equipment.update({
      where: { id },
      data: { status }
    });

    revalidatePath("/administration/equipments");
    return { success: true, message: "Statut mis à jour avec succès." };

  } catch (error) {
    console.error("Erreur updateEquipmentStatus:", error);
    return { success: false, error: "Une erreur est survenue lors de la mise à jour." };
  }
}