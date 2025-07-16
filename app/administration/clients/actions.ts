// app/administration/clients/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function saveClient(formData: FormData) {
  const id = formData.get("id") as string;
  const data = {
    // CORRECTION: Use the new field name 'nom'
    nom: formData.get("nom") as string, 
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    address: formData.get("address") as string,
    ice: formData.get("ice") as string,
    // Add other new fields from the v6 schema here as you build the form
  };

  try {
    if (id) {
      await prisma.client.update({
        where: { id },
        data,
      });
    } else {
      await prisma.client.create({
        data: {
            ...data,
            // Ensure required enum fields have default values if not in form
            type: 'ENTREPRISE', // Example default
        },
      });
    }
    
    revalidatePath("/administration/clients");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Une erreur est survenue." };
  }
}

export async function deleteClient(id: string) {
    if (!id) {
        return { success: false, error: "ID manquant." };
    }

    try {
        await prisma.client.delete({
            where: { id },
        });

        revalidatePath("/administration/clients");
        return { success: true };
    } catch (error) {
        console.error(error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2003') {
                 return { success: false, error: "Impossible de supprimer ce client car il est lié à des documents (devis, factures...)." };
            }
        }
        return { success: false, error: "Une erreur est survenue lors de la suppression." };
    }
}