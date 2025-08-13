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
    // --- THIS IS THE FIX ---
    // We must include the client data when fetching orders.
    prisma.order.findMany({
        where: { status: 'PENDING' },
        orderBy: { date: 'desc' },
        include: {
            client: true // This line was missing
        }
    }),
    prisma.employee.findMany({
        where: { user: { role: 'FIELD_WORKER' } }
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