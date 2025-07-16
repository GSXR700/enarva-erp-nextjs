// app/administration/invoices/[id]/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { InvoiceStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateInvoiceStatus(invoiceId: string, status: InvoiceStatus) {
  try {
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status },
    });
    revalidatePath(`/administration/invoices/${invoiceId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erreur lors de la mise à jour du statut." };
  }
}