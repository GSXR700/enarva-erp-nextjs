"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
    // Créer l'enregistrement de l'attachement
    await prisma.attachment.create({
      data: {
        missionId,
        documentUrl: `Attachement de validation pour la mission ${missionId}`,
        supervisorSignatureUrl,
        clientSignatureUrl,
        validatedAt: new Date(),
      },
    });

    // Mettre à jour le statut de la mission à "COMPLETED" (prête pour validation admin)
    await prisma.mission.update({
        where: { id: missionId },
        data: { status: 'COMPLETED' }
    });

    revalidatePath(`/administration/missions/${missionId}`);
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de l'attachement :", error);
    return { success: false, error: "Une erreur est survenue lors de l'enregistrement." };
  }
}