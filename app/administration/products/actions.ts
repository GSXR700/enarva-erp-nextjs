// app/administration/products/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Action pour créer ou mettre à jour un produit
export async function saveProduct(formData: FormData) {
  const id = formData.get("id") as string;
  const pu_ht_string = formData.get("pu_ht") as string;

  const data = {
    designation: formData.get("designation") as string,
    // Convertir le prix en nombre, en remplaçant la virgule par un point si nécessaire
    pu_ht: parseFloat(pu_ht_string.replace(',', '.')) || 0,
  };

  if (!data.designation || data.pu_ht <= 0) {
      return { success: false, error: "Veuillez remplir tous les champs correctement." };
  }

  try {
    if (id) {
      // Mise à jour
      await prisma.product.update({ where: { id }, data });
    } else {
      // Création
      await prisma.product.create({ data });
    }
    
    revalidatePath("/administration/products");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Une erreur est survenue lors de la sauvegarde." };
  }
}

// Action pour supprimer un produit
export async function deleteProduct(id: string) {
    if (!id) {
        return { success: false, error: "ID manquant." };
    }

    try {
        await prisma.product.delete({ where: { id } });
        revalidatePath("/administration/products");
        return { success: true };
    } catch (error) {
        console.error(error);

        // CORRECTION : Utiliser "Prisma" au lieu de "prisma" pour le type de l'erreur
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
            return { success: false, error: "Impossible de supprimer ce produit car il est utilisé dans des devis ou factures." };
        }
        return { success: false, error: "Une erreur est survenue lors de la suppression." };
    }
}