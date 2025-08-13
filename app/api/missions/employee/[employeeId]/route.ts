// app/api/missions/employee/[employeeId]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { MissionStatus } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: { employeeId: string } }
) {
  const { employeeId } = params;

  if (!employeeId) {
    return new NextResponse('ID de l\'employé manquant', { status: 400 });
  }

  try {
    const missions = await prisma.mission.findMany({
      where: {
        assignedToId: employeeId,
        status: {
          // --- FIX: Include missions awaiting approval in the mobile view ---
          in: [MissionStatus.PENDING, MissionStatus.IN_PROGRESS, MissionStatus.APPROBATION],
        },
      },
      include: {
        order: {
          include: {
            client: true, // To get the client's name and address
          },
        },
      },
      orderBy: {
        scheduledStart: 'asc',
      },
    });

    return NextResponse.json(missions);
  } catch (error) {
    console.error(`Erreur lors de la récupération des missions pour l'employé ${employeeId}:`, error);
    return new NextResponse('Erreur Interne du Serveur', { status: 500 });
  }
}