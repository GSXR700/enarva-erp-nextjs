// app/api/schedule/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const missionId = params.id;
  try {
    const body = await request.json();
    const { start, end } = body;

    if (!start || !end) {
      return new NextResponse('Les dates de début et de fin sont requises', { status: 400 });
    }

    const updatedMission = await prisma.mission.update({
      where: { id: missionId },
      data: {
        scheduledStart: new Date(start),
        scheduledEnd: new Date(end),
      },
    });

    return NextResponse.json(updatedMission);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la mission:", error);
    return new NextResponse('Erreur Interne du Serveur', { status: 500 });
  }
}