"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function assignSubcontractor(formData: FormData) {
  const missionId = formData.get('missionId') as string;
  const subcontractorId = formData.get('subcontractorId') as string;
  
  if (!missionId || !subcontractorId) {
    return { success: false, error: "Données manquantes pour l'assignation." };
  }

  await prisma.mission.update({
    where: { id: missionId },
    data: { subcontractorId },
  });
  revalidatePath(`/administration/missions/${missionId}`);
  return { success: true };
}

export async function updateSubcontractingStatus(missionId: string, status: 'sent' | 'returned') {
  const updateData = status === 'sent' 
    ? { sentToSubcontractorAt: new Date() }
    : { returnedFromSubcontractorAt: new Date() };

  await prisma.mission.update({
    where: { id: missionId },
    data: updateData
  });
  revalidatePath(`/administration/missions/${missionId}`);
  return { success: true };
}