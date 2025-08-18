// app/administration/missions/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { MissionStatus, Prisma } from "@prisma/client";
import { createAndEmitNotification } from "@/lib/notificationService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type ActionResponse = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

// --- Mission Management ---

const missionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères.").optional(),
  orderId: z.string().optional(),
  assignedToId: z.string().min(1, "Un employé doit être assigné."),
  scheduledStart: z.coerce.date(),
  scheduledEnd: z.coerce.date(),
  notes: z.string().max(1000, "Les notes ne peuvent pas dépasser 1000 caractères.").optional(),
}).refine(data => data.scheduledEnd > data.scheduledStart, {
    message: "La date de fin doit être postérieure à la date de début.",
    path: ["scheduledEnd"],
});

export async function saveMission(formData: FormData): Promise<ActionResponse> {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedFields = missionSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return { success: false, message: 'Champs invalides.', errors: validatedFields.error.flatten().fieldErrors };
    }

    const { id, ...data } = validatedFields.data;
    const dataToSave = {
      ...data,
      orderId: data.orderId || null,
      title: data.orderId ? undefined : data.title,
    };
    
    const mission = id 
        ? await prisma.mission.update({ where: { id }, data: dataToSave })
        : await prisma.mission.create({ data: { ...dataToSave, status: MissionStatus.PENDING } });
    
    await createAndEmitNotification({
        userId: mission.assignedToId,
        message: `La mission '${mission.title || mission.workOrderNumber}' a été ${id ? 'mise à jour' : 'assignée'}.`,
        link: `/mobile`
    });

    revalidatePath("/administration/missions");
    revalidatePath("/administration/planning");
    return { success: true, message: `Mission ${id ? 'modifiée' : 'créée'} avec succès.` };

  } catch (error) {
    console.error("Erreur saveMission:", error);
    return { success: false, message: "Une erreur est survenue." };
  }
}

export async function deleteMission(id: string): Promise<ActionResponse> {
    if (!id) return { success: false, message: "ID manquant." };
    try {
        const mission = await prisma.mission.findUnique({
            where: { id },
            include: { _count: { select: { observations: true } } }
        });
        if (!mission) return { success: false, message: "Mission non trouvée." };
        if (mission.status === 'IN_PROGRESS') return { success: false, message: "Impossible de supprimer une mission en cours." };
        await prisma.mission.delete({ where: { id } });
        revalidatePath("/administration/missions");
        revalidatePath("/administration/planning");
        return { success: true, message: "Mission supprimée avec succès." };
    } catch (error) {
        console.error("Erreur deleteMission:", error);
        return { success: false, message: "Une erreur est survenue lors de la suppression." };
    }
}

// --- Mission Validation Workflow ---

async function getNextInvoiceAndDeliveryNoteNumbers() {
    const [allInvoices, allDeliveryNotes] = await Promise.all([
        prisma.invoice.findMany({ select: { invoiceNumber: true } }),
        prisma.deliveryNote.findMany({ select: { deliveryNoteNumber: true } })
    ]);

    const findMaxSerial = (docs: any[], key: string) => {
        return docs.reduce((max, doc) => {
            const fullNumber = doc[key] as string;
            if (!fullNumber) return max;
            const match = fullNumber.match(/\d+/);
            if (!match) return max;
            const num = parseInt(match[0], 10);
            return num > max ? num : max;
        }, 0);
    };

    const year = new Date().getFullYear();
    const nextInvoiceNum = Math.max(findMaxSerial(allInvoices, 'invoiceNumber'), 35) + 1;
    const nextDeliveryNum = Math.max(findMaxSerial(allDeliveryNotes, 'deliveryNoteNumber'), 99) + 1;

    return {
        invoiceNumber: `N ° ${String(nextInvoiceNum)}/${year}`,
        deliveryNoteNumber: `BL-${String(nextDeliveryNum)}/${year}`,
    };
}

export async function deleteObservation(id: string) {
    if (!id) return { success: false, error: "ID manquant." };
    try {
        const observation = await prisma.observation.findUnique({ where: { id } });
        if (!observation) return { success: false, error: "Observation non trouvée." };
        
        await prisma.observation.delete({ where: { id } });
        
        revalidatePath(`/administration/missions/${observation.missionId}`);
        return { success: true };
    } catch (error) {
        console.error("Erreur lors de la suppression de l'observation:", error);
        return { success: false, error: "Une erreur est survenue." };
    }
}

export async function deleteQualityCheck(id: string) {
    if (!id) return { success: false, error: "ID manquant." };
    try {
        const qualityCheck = await prisma.qualityCheck.findUnique({ where: { id } });
        if (!qualityCheck) return { success: false, error: "Rapport qualité non trouvé." };

        await prisma.qualityCheck.delete({ where: { id } });

        revalidatePath(`/administration/missions/${qualityCheck.missionId}`);
        return { success: true };
    } catch (error) {
        console.error("Erreur lors de la suppression du rapport qualité:", error);
        return { success: false, error: "Une erreur est survenue." };
    }
}

export async function deleteAttachment(id: string) {
    if (!id) return { success: false, error: "ID manquant." };
    try {
        const attachment = await prisma.attachment.findUnique({ where: { id } });
        if (!attachment) return { success: false, error: "Attachement non trouvé." };
        
        await prisma.attachment.delete({ where: { id } });
        
        revalidatePath(`/administration/missions/${attachment.missionId}`);
        return { success: true };
    } catch (error) {
        console.error("Erreur lors de la suppression de l'attachement:", error);
        return { success: false, error: "Une erreur est survenue." };
    }
}

export async function validateMission(missionId: string, orderId: string | null) {
    const session = await getServerSession(authOptions);
    
    // If no orderId, just validate the mission without generating invoice/delivery note
    if (!orderId) {
        try {
            await prisma.mission.update({ 
                where: { id: missionId }, 
                data: { status: 'VALIDATED' } 
            });
            
            revalidatePath(`/administration/missions/${missionId}`);
            return { success: true };
        } catch (error) {
            console.error("Erreur validateMission (no order):", error);
            return { success: false, error: "Erreur lors de la validation de la mission." };
        }
    }

    // If orderId exists, proceed with invoice/delivery note generation
    const order = await prisma.order.findUnique({ 
        where: { id: orderId }, 
        include: { client: true } 
    });

    if (!order) {
        return { success: false, error: "Commande associée introuvable." };
    }

    const existingInvoice = await prisma.invoice.findFirst({ 
        where: { orderId: order.id } 
    });
    
    if (existingInvoice) {
        await prisma.mission.update({ 
            where: { id: missionId }, 
            data: { status: 'VALIDATED' } 
        });
        revalidatePath(`/administration/missions/${missionId}`);
        return { success: true };
    }

    try {
        const { invoiceNumber, deliveryNoteNumber } = await getNextInvoiceAndDeliveryNoteNumbers();
        const now = new Date();
        const itemsAsJsonArray = order.items as Prisma.JsonArray;
        const totalTTC = order.totalTTC;
        const totalHT = totalTTC / 1.2;
        const tva = totalTTC - totalHT;

        await prisma.$transaction(async (tx) => {
            await tx.invoice.create({
                data: {
                    invoiceNumber, 
                    date: now, 
                    dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
                    status: 'DRAFT', 
                    orderId: order.id, 
                    clientId: order.clientId, 
                    items: itemsAsJsonArray,
                    totalHT, 
                    tva, 
                    totalTTC,
                }
            });
            
            await tx.deliveryNote.create({
                data: {
                    deliveryNoteNumber, 
                    date: now, 
                    orderId: order.id,
                    items: (itemsAsJsonArray as any[]).map(item => ({
                        designation: item.designation, 
                        qteCommandee: item.quantity, 
                        qteLivree: item.quantity,
                    })) as Prisma.JsonArray,
                }
            });
            
            await tx.mission.update({ 
                where: { id: missionId }, 
                data: { status: 'VALIDATED' } 
            });
            
            await tx.order.update({ 
                where: { id: orderId }, 
                data: { status: 'DELIVERED' } 
            });
        });

        if (session?.user?.id) {
            await createAndEmitNotification({
                userId: session.user.id,
                message: `Documents générés pour la commande ${order.orderNumber}.`,
                link: `/administration/invoices`
            });
        }

        revalidatePath(`/administration/missions/${missionId}`);
        revalidatePath('/administration/invoices');
        revalidatePath('/administration/delivery-notes');
        
        // Only redirect to invoices if we generated documents
        redirect(`/administration/invoices`);

    } catch (error) {
        console.error("Erreur validateMission:", error);
        return { success: false, error: "Erreur lors de la génération des documents." };
    }
}

// --- Attachment Actions ---

interface SaveAttachmentData {
  missionId: string;
  supervisorSignatureUrl: string;
  clientSignatureUrl: string;
}

export async function saveAttachment(data: SaveAttachmentData) {
  const { missionId, supervisorSignatureUrl, clientSignatureUrl } = data;
  if (!missionId || !supervisorSignatureUrl || !clientSignatureUrl) {
    return { success: false, error: "Les données des signatures sont manquantes." };
  }
  try {
    await prisma.attachment.create({
      data: {
        missionId,
        documentUrl: `Attachement de validation pour la mission ${missionId}`,
        supervisorSignatureUrl,
        clientSignatureUrl,
        validatedAt: new Date(),
      },
    });
    await prisma.mission.update({
        where: { id: missionId },
        data: { status: 'APPROBATION' }
    });
    revalidatePath(`/administration/missions/${missionId}`);
    return { success: true };
  } catch (error) {
    console.error("Erreur saveAttachment:", error);
    return { success: false, error: "Une erreur est survenue." };
  }
}

// --- Subcontracting Actions ---

export async function assignSubcontractor(formData: FormData) {
  const missionId = formData.get('missionId') as string;
  const subcontractorId = formData.get('subcontractorId') as string;
  if (!missionId || !subcontractorId) {
    return { success: false, error: "Données manquantes pour l'assignation." };
  }
  await prisma.mission.update({ where: { id: missionId }, data: { subcontractorId } });
  revalidatePath(`/administration/missions/${missionId}`);
  return { success: true };
}

export async function updateSubcontractingStatus(missionId: string, status: 'sent' | 'returned') {
  const updateData = status === 'sent'
    ? { sentToSubcontractorAt: new Date() }
    : { returnedFromSubcontractorAt: new Date() };
  await prisma.mission.update({ where: { id: missionId }, data: updateData });
  revalidatePath(`/administration/missions/${missionId}`);
  return { success: true };
}
