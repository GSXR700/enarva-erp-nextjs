// app/administration/clients/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function saveClient(formData: FormData) {
  const id = formData.get("id") as string;
  const data = {
    nom: formData.get("nom") as string,
    email: formData.get("email") as string,
    telephone: formData.get("telephone") as string || null,
    adresse: formData.get("adresse") as string || null,
    secteur: formData.get("secteur") as string || null,
    contact_secondaire: formData.get("contact_secondaire") as string || null,
    statut: formData.get("statut") as any || 'ACTIF',
    type: formData.get("type") as any || 'ENTREPRISE',
    mode_paiement_prefere: formData.get("mode_paiement_prefere") as any || null,
    contrat_en_cours: formData.get("contrat_en_cours") === 'true',
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
          type: data.type || 'ENTREPRISE',
          statut: data.statut || 'ACTIF',
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