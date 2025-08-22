// app/api/tracking/employees/route.ts
// 🔧 CORRECTION: Ajouter les missions aux users avec localisation
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔍 API: Starting tracking employees fetch...');
    
    // 1. D'abord récupérer les users avec localisation
    const usersWithLocation = await prisma.user.findMany({
      where: {
        currentLatitude: { not: null },
        currentLongitude: { not: null },
      },
      select: {
        id: true,
        name: true,
        image: true,
        currentLatitude: true,
        currentLongitude: true,
        lastSeen: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
    });

    console.log(`📊 API: Found ${usersWithLocation.length} users with location`);

    if (usersWithLocation.length === 0) {
      console.log('⚠️ No users with location found');
      return NextResponse.json([]);
    }

    // 2. Pour chaque user qui a un employee, récupérer ses missions actives
    const enrichedUsers = await Promise.all(
      usersWithLocation.map(async (user) => {
        let currentMission = null;

        if (user.employee) {
          // Récupérer la mission active de cet employé
          const activeMission = await prisma.mission.findFirst({
            where: {
              assignedToId: user.employee.id,
              status: { in: ['PENDING', 'IN_PROGRESS'] }
            },
            select: {
              id: true,
              title: true,
              workOrderNumber: true,
              status: true,
              scheduledStart: true,
              scheduledEnd: true,
              order: {
                select: {
                  client: {
                    select: { nom: true }
                  }
                }
              }
            },
            orderBy: { scheduledStart: 'asc' }
          });

          if (activeMission) {
            currentMission = {
              id: activeMission.id,
              title: activeMission.title || 
                     activeMission.workOrderNumber || 
                     `Mission chez ${activeMission.order?.client?.nom || 'Client'}`,
              status: activeMission.status,
              scheduledStart: activeMission.scheduledStart,
              scheduledEnd: activeMission.scheduledEnd
            };
          }
        }

        return {
          id: user.id,
          name: user.name || (user.employee ? `${user.employee.firstName} ${user.employee.lastName}` : 'Employé'),
          image: user.image,
          currentLatitude: user.currentLatitude,
          currentLongitude: user.currentLongitude,
          lastSeen: user.lastSeen,
          currentMission
        };
      })
    );

    const usersWithMissions = enrichedUsers.filter(user => user.currentMission);
    console.log(`🎯 API: ${usersWithMissions.length} users have active missions`);
    console.log('📍 Final data:', enrichedUsers);

    return NextResponse.json(enrichedUsers);

  } catch (error) {
    console.error("❌ API Error [GET_TRACKED_EMPLOYEES]:", error);
    return new NextResponse('Erreur Interne du Serveur', { status: 500 });
  }
}