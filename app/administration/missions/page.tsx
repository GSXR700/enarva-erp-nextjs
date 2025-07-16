// app/administration/missions/page.tsx

import prisma from "@/lib/prisma";
import { MissionsPageClient } from "./components/MissionsPageClient";
import type { Mission, Order, Employee, Client } from "@prisma/client";

// CORRECTION : Le type MissionWithDetails est maintenant aligné avec les données de Prisma
// Il accepte que la relation 'order' puisse être 'null'.
interface MissionWithRelations extends Mission {
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

// Ce composant serveur ne change pas sa logique de fetch.
export default async function MissionsPage({ searchParams }: MissionsPageProps) {
  try {
    const page = Number(searchParams["page"]) || 1;
    const itemsPerPage = Number(searchParams["per_page"]) || 10;
    const skip = (page - 1) * itemsPerPage;

    if (page < 1) {
      throw new Error("La page doit être un nombre positif");
    }

    const [missions, totalMissions, allOrders, allEmployees] = await prisma.$transaction([
    prisma.mission.findMany({
      orderBy: { scheduledStart: "desc" },
      include: {
        assignedTo: true,
        order: {
          include: {
            client: true
          }
        },
        _count: {
          select: {
            observations: true
          }
        }
      },
      skip: skip,
      take: itemsPerPage,
    }),
    prisma.mission.count(),
    prisma.order.findMany({
      where: { status: 'PENDING' },
      orderBy: { date: 'desc' },
      include: {
        client: true
      }
    }),
    prisma.employee.findMany({
      where: { 
        user: { role: 'FIELD_WORKER' }
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' }
      ]
    })
  ]);

  const hasNextPage = (page * itemsPerPage) < totalMissions;
  const hasPrevPage = page > 1;

  // Le type 'missions' retourné par Prisma correspond maintenant au type attendu par MissionsPageClient.
  return (
    <MissionsPageClient
      missions={missions as MissionWithRelations[]}
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
          Erreur lors du chargement des missions
        </h3>
        <p className="mt-2 text-sm text-red-700 dark:text-red-300">
          {error instanceof Error ? error.message : "Une erreur inattendue s'est produite."}
        </p>
      </div>
    );
  }
}
