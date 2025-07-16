// enarva-nextjs-dashboard-app/app/administration/suppliers/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function saveSupplier(formData: FormData) {
  const id = formData.get("id") as string;
  const data = {
    name: formData.get("name") as string,
    email: formData.get("email") as string || null,
    phone: formData.get("phone") as string || null,
    address: formData.get("address") as string || null,
    contact: formData.get("contact") as string || null,
  };

  if (!data.name) {
    return { success: false, error: "Le nom du fournisseur est requis." };
  }

  try {
    if (id) {
      await prisma.supplier.update({ where: { id }, data });
    } else {
      await prisma.supplier.create({ data });
    }
    
    revalidatePath("/administration/suppliers");
    return { success: true };
  } catch (error) {
    console.error("Erreur sauvegarde Fournisseur:", error);
     if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { success: false, error: "Un fournisseur avec ce nom ou cet email existe déjà." };
    }
    return { success: false, error: "Une erreur est survenue." };
  }
}

export async function deleteSupplier(id: string) {
    if (!id) {
        return { success: false, error: "ID manquant." };
    }
    try {
        await prisma.supplier.delete({ where: { id } });
        revalidatePath("/administration/suppliers");
        return { success: true };
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
            return { success: false, error: "Impossible de supprimer: ce fournisseur est lié à des dépenses." };
        }
        return { success: false, error: "Une erreur est survenue." };
    }
}