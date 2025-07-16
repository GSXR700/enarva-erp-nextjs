"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { EquipmentStatus } from "@prisma/client";

export async function saveEquipment(formData: FormData) {
  const id = formData.get("id") as string;
  const data = {
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    serialNumber: formData.get("serialNumber") as string || null,
    purchaseDate: formData.get("purchaseDate") ? new Date(formData.get("purchaseDate") as string) : null,
    status: formData.get("status") as EquipmentStatus,
  };

  if (!data.name || !data.type || !data.status) {
    return { success: false, error: "Le nom, le type et le statut sont requis." };
  }

  try {
    if (id) {
      await prisma.equipment.update({ where: { id }, data });
    } else {
      await prisma.equipment.create({ data });
    }
    revalidatePath("/administration/equipments");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Une erreur est survenue." };
  }
}

export async function deleteEquipment(id: string) {
  try {
    // Il faudrait ajouter une vérification pour empêcher la suppression si l'équipement a des tickets ouverts
    await prisma.equipment.delete({ where: { id } });
    revalidatePath("/administration/equipments");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Impossible de supprimer cet équipement." };
  }
}