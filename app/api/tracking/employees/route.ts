// app/api/tracking/employees/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return new NextResponse("Accès non autorisé", { status: 403 });
    }

    // 🔧 SOLUTION FINALE: Requête via Employee avec la relation correcte
    const employeesWithMissions = await prisma.employee.findMany({
      where: {
        user: {
          AND: [
            {
              OR: [
                { currentLatitude: { not: null } },
                { currentLongitude: { not: null } }
              ]
            }
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
        // 🔧 CORRECTION: 'missions' est la relation correcte sur Employee
        missions: {
          where: {
            status: {
              in: ['PENDING', 'IN_PROGRESS'] // Missions actives
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
          take: 1 // Mission la plus proche
        }
      },
      orderBy: {
        user: {
          lastSeen: 'desc'
        }
      }
    });

    // Transformer les données pour le frontend
    const formattedEmployees = employeesWithMissions.map(employee => {
      const currentMission = employee.missions[0];
      
      return {
        id: employee.user.id, // ID du User pour Socket.IO
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

    return NextResponse.json(formattedEmployees);

  } catch (error) {
    console.error("[TRACKING_EMPLOYEES_ERROR]", error);
    return new NextResponse("Erreur Interne du Serveur", { status: 500 });
  }
}