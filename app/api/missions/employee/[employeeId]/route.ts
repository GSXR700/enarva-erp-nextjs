// app/api/missions/employee/[employeeId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { employeeId: string } }
) {
  try {
    console.log(`🔍 API: Fetching missions for employee ${params.employeeId}`);
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log("❌ API: Unauthorized - no session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { employeeId } = params;

    // Verify employee exists and user has access
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { 
        user: { 
          select: { id: true, role: true, name: true } 
        } 
      }
    });

    if (!employee) {
      console.log(`❌ API: Employee ${employeeId} not found`);
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Check if user is accessing their own missions or has admin/manager role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, id: true }
    });

    const hasAccess = user?.id === employee.userId || 
                     ['ADMIN', 'MANAGER'].includes(user?.role || '');

    if (!hasAccess) {
      console.log(`❌ API: Access denied for user ${session.user.id} to employee ${employeeId}`);
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get current date range (today and recent missions)
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    console.log(`📅 API: Searching missions from ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);

    // Fetch missions assigned to this employee
    const missions = await prisma.mission.findMany({
      where: {
        assignedToId: employeeId,
        OR: [
          // Missions scheduled for today
          {
            scheduledStart: {
              gte: startOfDay,
              lte: endOfDay
            }
          },
          // Or missions currently in progress (regardless of schedule)
          {
            status: 'IN_PROGRESS'
          },
          // Or missions waiting for approval from recent days
          {
            status: 'APPROBATION',
            actualEnd: {
              gte: sevenDaysAgo
            }
          },
          // Or recently completed missions
          {
            status: 'COMPLETED',
            actualEnd: {
              gte: sevenDaysAgo
            }
          },
          // Or recently validated missions
          {
            status: 'VALIDATED',
            actualEnd: {
              gte: sevenDaysAgo
            }
          }
        ]
      },
      include: {
        order: {
          include: {
            client: {
              select: {
                id: true,
                nom: true,
                adresse: true,
                telephone: true
              }
            }
          }
        },
        timeLogs: {
          where: { 
            employeeId: employeeId,
            endTime: null // Only active time logs
          },
          orderBy: { startTime: 'desc' },
          take: 1
        },
        assignedTo: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: [
        // Prioritize by status (active missions first)
        {
          status: 'asc'
        },
        // Then by scheduled time
        { 
          scheduledStart: 'asc' 
        }
      ]
    });

    console.log(`📦 API: Found ${missions.length} missions for employee ${employeeId}`);
    console.log(`📋 API: Mission statuses:`, missions.map(m => ({ id: m.id, status: m.status })));

    // Add computed fields for better frontend handling
    const enhancedMissions = missions.map(mission => ({
      ...mission,
      // Helper flags for UI
      isActive: ['IN_PROGRESS', 'APPROBATION'].includes(mission.status),
      canStart: mission.status === 'PENDING',
      canStop: mission.status === 'IN_PROGRESS',
      isWaitingApproval: mission.status === 'APPROBATION',
      hasActiveTimeLog: mission.timeLogs.length > 0,
      // Clean up sensitive data
      assignedTo: undefined, // Remove from response for mobile
      timeLogs: undefined    // Remove from response for mobile
    }));

    console.log(`✅ API: Returning ${enhancedMissions.length} enhanced missions`);

    return NextResponse.json(enhancedMissions, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error("❌ API: Error fetching employee missions:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, 
      { status: 500 }
    );
  }
}