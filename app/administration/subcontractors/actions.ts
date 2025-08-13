// app/administration/subcontractors/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveSubcontractor(formData: FormData) {
  const id = formData.get("id") as string;
  const data = {
    name: formData.get("name") as string,
    serviceType: formData.get("serviceType") as string,
    contact: formData.get("contact") as string || null,
    phone: formData.get("phone") as string || null,
    email: formData.get("email") as string || null,
    // ADDED: Handle commissionRate, converting it to a float
    commissionRate: parseFloat(formData.get("commissionRate") as string) || 0,
  };

  try {
    if (id) {
      await prisma.subcontractor.update({ where: { id }, data });
    } else {
      await prisma.subcontractor.create({ data });
    }
    revalidatePath("/administration/subcontractors");
  } catch (error) {
    console.error(error);
  }
}

export async function deleteSubcontractor(id: string) {
  try {
    await prisma.subcontractor.delete({ where: { id } });
    revalidatePath("/administration/subcontractors");
  } catch (error) {
    console.error(error);
  }
}