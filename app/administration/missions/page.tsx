// app/administration/missions/page.tsx
import prisma from "@/lib/prisma";
import { MissionsPageClient } from "./components/MissionsPageClient";
import type { Mission, Order, Employee, Client } from "@prisma/client";

// FIX: This type is now correctly defined and exported for use in child components.
export interface MissionWithDetails extends Mission {
  order: (Order & {
    client: Client;
  }) | null;
  assignedTo: Employee | null;
  _count: {
    observations: number;
  };
}

interface MissionsPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function MissionsPage({ searchParams }: MissionsPageProps) {
  try {
    const page = Number(searchParams["page"]) || 1;
    const itemsPerPage = Number(searchParams["per_page"]) || 10;
    const skip = (page - 1) * itemsPerPage;

    const [missions, totalMissions, allOrders, allEmployees] = await prisma.$transaction([
      prisma.mission.findMany({
        orderBy: { scheduledStart: "desc" },
        include: {
          assignedTo: true,
          order: { include: { client: true } },
          _count: { select: { observations: true } }
        },
        skip,
        take: itemsPerPage,
      }),
      prisma.mission.count(),
      prisma.order.findMany({
        where: { status: 'PENDING' },
        orderBy: { date: 'desc' },
        include: { client: true }
      }),
      prisma.employee.findMany({
        where: { user: { role: 'FIELD_WORKER' } },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }]
      })
    ]);

    const hasNextPage = (page * itemsPerPage) < totalMissions;
    const hasPrevPage = page > 1;

    return (
      <MissionsPageClient
        missions={missions as MissionWithDetails[]}
        totalMissions={totalMissions}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
        itemsPerPage={itemsPerPage}
        allOrders={allOrders}
        allEmployees={allEmployees}
      />
    );
  } catch (error) {
    console.error("Erreur lors du chargement des missions:", error);
    return (
      <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-400">
          Erreur de chargement
        </h3>
        <p className="mt-2 text-sm text-red-700 dark:text-red-300">
          {error instanceof Error ? error.message : "Une erreur inattendue s'est produite."}
        </p>
      </div>
    );
  }
}