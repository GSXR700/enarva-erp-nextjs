// app/api/tracking/employees/route.ts
// 🔧 CORRECTION: Utiliser la structure correcte avec les missions
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    console.log('🔍 API: Starting to fetch tracked employees...');
    
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      console.log('❌ API: Unauthorized access');
      return new NextResponse("Accès non autorisé", { status: 403 });
    }

    // 🔧 SOLUTION 1: D'abord, tester la requête simple pour voir s'il y a des users avec location
    const usersWithLocation = await prisma.user.findMany({
      where: {
        AND: [
          { currentLatitude: { not: null } },
          { currentLongitude: { not: null } }
        ]
      },
      select: {
        id: true,
        name: true,
        image: true,
        currentLatitude: true,
        currentLongitude: true,
        lastSeen: true,
      }
    });

    console.log(`📊 API: Found ${usersWithLocation.length} users with location`);
    
    if (usersWithLocation.length === 0) {
      console.log('⚠️ API: No users have location data in database');
      return NextResponse.json([]);
    }

    // 🔧 SOLUTION 2: Si on a des users avec location, essayer de récupérer leurs infos employés + missions
    const employeesWithMissions = await prisma.employee.findMany({
      where: {
        user: {
          AND: [
            { currentLatitude: { not: null } },
            { currentLongitude: { not: null } }
          ]
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            currentLatitude: true,
            currentLongitude: true,
            lastSeen: true
          }
        },
        missions: {
          where: {
            status: {
              in: ['PENDING', 'IN_PROGRESS']
            }
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
                  select: {
                    nom: true
                  }
                }
              }
            }
          },
          orderBy: {
            scheduledStart: 'asc'
          },
          take: 1
        }
      }
    });

    console.log(`👥 API: Found ${employeesWithMissions.length} employees with location`);

    // 🔧 FALLBACK: Si pas d'employés trouvés, retourner les users simples
    if (employeesWithMissions.length === 0) {
      console.log('⚠️ API: No employees found, returning users with location');
      const simpleUsers = usersWithLocation.map(user => ({
        id: user.id,
        name: user.name,
        image: user.image,
        currentLatitude: user.currentLatitude,
        currentLongitude: user.currentLongitude,
        lastSeen: user.lastSeen,
        currentMission: null
      }));
      return NextResponse.json(simpleUsers);
    }

    // 🔧 FORMAT: Transformer les données pour le frontend
    const formattedEmployees = employeesWithMissions.map(employee => {
      const currentMission = employee.missions[0];
      
      return {
        id: employee.user.id,
        name: employee.user.name || `${employee.firstName} ${employee.lastName}`,
        image: employee.user.image,
        currentLatitude: employee.user.currentLatitude,
        currentLongitude: employee.user.currentLongitude,
        lastSeen: employee.user.lastSeen,
        currentMission: currentMission ? {
          id: currentMission.id,
          title: currentMission.title || 
                 currentMission.workOrderNumber || 
                 `Mission chez ${currentMission.order?.client?.nom || 'Client'}`,
          status: currentMission.status,
          scheduledStart: currentMission.scheduledStart,
          scheduledEnd: currentMission.scheduledEnd
        } : null
      };
    });

    console.log(`✅ API: Returning ${formattedEmployees.length} formatted employees`);
    return NextResponse.json(formattedEmployees);

  } catch (error) {
    console.error("❌ API: Error in tracking/employees:", error);
    return new NextResponse("Erreur Interne du Serveur", { status: 500 });
  }
}