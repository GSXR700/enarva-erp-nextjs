// app/api/tracking/employees/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔍 API: Starting tracking employees fetch...');
    
    // 1. D'abord récupérer les users avec localisation
    const usersWithLocation = await prisma.user.findMany({
      where: {
        AND: [
          { currentLatitude: { not: null } },
          { currentLongitude: { not: null } },
          { role: { in: ['FIELD_WORKER', 'MANAGER', 'ADMIN'] } }
        ]
      },
      select: {
        id: true,
        name: true,
        image: true,
        currentLatitude: true,
        currentLongitude: true,
        lastSeen: true,
        role: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        lastSeen: 'desc'
      }
    });

    console.log(`📊 API: Found ${usersWithLocation.length} users with location`);

    if (usersWithLocation.length === 0) {
      console.log('⚠️ No users with location found');
      return NextResponse.json([]);
    }

    // 2. Pour chaque user qui a un employee, récupérer ses missions actives
    const enrichedUsers = await Promise.all(
      usersWithLocation.map(async (user) => {
        let missions: any[] = [];

        if (user.employee) {
          // Récupérer TOUTES les missions actives de cet employé (pas juste une)
          const activeMissions = await prisma.mission.findMany({
            where: {
              assignedToId: user.employee.id,
              status: { in: ['PENDING', 'IN_PROGRESS', 'APPROBATION'] }
            },
            select: {
              id: true,
              title: true,
              workOrderNumber: true,
              status: true,
              scheduledStart: true,
              scheduledEnd: true,
              actualStart: true,
              actualEnd: true,
              notes: true,
              order: {
                select: {
                  id: true,
                  orderNumber: true,
                  client: {
                    select: { 
                      id: true,
                      nom: true, 
                      adresse: true,
                      telephone: true
                    }
                  }
                }
              }
            },
            orderBy: [
              { status: 'asc' }, // Missions IN_PROGRESS en premier
              { scheduledStart: 'asc' }
            ]
          });

          missions = activeMissions.map(mission => ({
            id: mission.id,
            title: mission.title || 
                   mission.workOrderNumber || 
                   `Mission chez ${mission.order?.client?.nom || 'Client'}`,
            status: mission.status,
            scheduledStart: mission.scheduledStart,
            scheduledEnd: mission.scheduledEnd,
            actualStart: mission.actualStart,
            actualEnd: mission.actualEnd,
            notes: mission.notes,
            order: mission.order ? {
              id: mission.order.id,
              orderNumber: mission.order.orderNumber,
              client: mission.order.client
            } : null
          }));
        }

        // Déterminer le nom de l'employé
        const employeeName = user.employee 
          ? `${user.employee.firstName} ${user.employee.lastName}`.trim()
          : user.name || 'Employé';

        return {
          id: user.employee?.id || user.id, // Utiliser l'ID de l'employé si disponible
          name: employeeName,
          image: user.image,
          currentLatitude: user.currentLatitude,
          currentLongitude: user.currentLongitude,
          lastSeen: user.lastSeen,
          role: user.role,
          missions: missions,
          // Informations de compatibilité pour le frontend
          hasActiveMission: missions.some(m => m.status === 'IN_PROGRESS'),
          missionCount: missions.length,
          employeeId: user.employee?.id,
          userId: user.id
        };
      })
    );

    // Trier : employés avec missions actives en premier
    const sortedUsers = enrichedUsers.sort((a, b) => {
      if (a.hasActiveMission && !b.hasActiveMission) return -1;
      if (!a.hasActiveMission && b.hasActiveMission) return 1;
      return b.missionCount - a.missionCount;
    });

    const usersWithMissions = sortedUsers.filter(user => user.missions.length > 0);
    console.log(`🎯 API: ${usersWithMissions.length} users have active missions`);
    console.log(`📍 API: Total ${sortedUsers.length} tracked users (${usersWithMissions.length} with missions)`);

    // Log pour debug
    sortedUsers.forEach(user => {
      console.log(`👤 ${user.name}: ${user.missions.length} missions, status: ${user.missions.map(m => m.status).join(', ')}`);
    });

    return NextResponse.json(sortedUsers, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error("❌ API Error [GET_TRACKED_EMPLOYEES]:", error);
    return NextResponse.json(
      { 
        error: "Erreur Interne du Serveur",
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, 
      { status: 500 }
    );
  }
}