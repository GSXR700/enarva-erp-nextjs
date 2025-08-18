// app/administration/planning/page.tsx
import prisma from "@/lib/prisma";
import { PlanningPageClient } from "./components/PlanningPageClient";

export default async function PlanningPage() {

  const [missions, allOrders, allEmployees] = await Promise.all([
    prisma.mission.findMany({
        include: {
            assignedTo: { select: { firstName: true, lastName: true } },
            order: { include: { client: { select: { nom: true } } } }
        }
    }),
    // 🔧 CORRECTION: S'assurer que les commandes incluent bien les données client
    prisma.order.findMany({
        where: { status: 'PENDING' },
        orderBy: { date: 'desc' },
        include: {
            client: true // ✅ Cette ligne est essentielle pour inclure les données client
        }
    }),
    prisma.employee.findMany({
        where: { user: { role: 'FIELD_WORKER' } },
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }]
    })
  ]);

  const initialEvents = missions.map(mission => {
    const assignedEmployee = allEmployees.find(emp => emp.id === mission.assignedToId);
    const assignedName = assignedEmployee ? `${assignedEmployee.firstName}` : "Non assigné";
    const title = mission.title || `${mission.order?.client?.nom} - ${assignedName}`;

    return {
      id: mission.id,
      title: title,
      start: mission.scheduledStart,
      end: mission.scheduledEnd,
      color: mission.status === 'COMPLETED' ? '#10B981' : '#3B82F6'
    }
  });

  return (
    <PlanningPageClient
        initialEvents={initialEvents}
        allOrders={allOrders}
        allEmployees={allEmployees}
    />
  );
}