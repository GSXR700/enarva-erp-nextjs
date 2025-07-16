// app/api/schedule/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const missions = await prisma.mission.findMany({
      where: {
        status: { not: 'CANCELLED' } // On n'affiche pas les missions annulées
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        },
        order: {
          include: {
            client: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    // Formate les données pour le composant calendrier
    const scheduleEvents = missions.map(mission => ({
      id: mission.id,
      title: `Mission chez ${mission.order.client.name}`,
      start: mission.scheduledStart,
      end: mission.scheduledEnd,
      employeeId: mission.assignedToId,
      employeeName: `${mission.assignedTo.firstName} ${mission.assignedTo.lastName}`,
    }));

    return NextResponse.json(scheduleEvents);
  } catch (error) {
    console.error("Erreur lors de la récupération du planning:", error);
    return new NextResponse('Erreur Interne du Serveur', { status: 500 });
  }
}