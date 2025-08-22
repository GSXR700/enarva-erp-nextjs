// app/api/tracking/employees/route.ts
// 🔧 CORRECTION COMPLÈTE: API compatible avec nouveau LiveMap
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

    // 2. Pour chaque user qui a un employee, récupérer sa mission active UNIQUE
    const enrichedUsers = await Promise.all(
      usersWithLocation.map(async (user) => {
        let currentMission = null;

        if (user.employee) {
          // Récupérer LA mission active de cet employé (une seule)
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
            orderBy: [
              { status: 'asc' }, // IN_PROGRESS en premier
              { scheduledStart: 'asc' }
            ]
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
          currentMission // ← AJOUT CRUCIAL pour compatibility LiveMap
        };
      })
    );

    // Trier : employés avec missions actives en premier
    const sortedUsers = enrichedUsers.sort((a, b) => {
      if (a.currentMission && !b.currentMission) return -1;
      if (!a.currentMission && b.currentMission) return 1;
      return 0;
    });

    const usersWithMissions = sortedUsers.filter(user => user.currentMission);
    console.log(`🎯 API: ${usersWithMissions.length} users have active missions`);
    console.log(`📍 API: Total ${sortedUsers.length} tracked users (${usersWithMissions.length} with missions)`);

    // Log pour debug
    sortedUsers.forEach(user => {
      console.log(`👤 ${user.name}: ${user.currentMission ? 'HAS' : 'NO'} active mission${user.currentMission ? ` (${user.currentMission.status})` : ''}`);
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