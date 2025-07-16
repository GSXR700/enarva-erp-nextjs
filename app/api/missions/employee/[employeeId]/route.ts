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
          in: [MissionStatus.PENDING, MissionStatus.IN_PROGRESS],
        },
        // Vous pouvez décommenter cette section pour ne voir que les missions du jour
        /*
        scheduledStart: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
        */
      },
      include: {
        order: {
          include: {
            client: true, // Pour avoir l'adresse et le nom du client
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