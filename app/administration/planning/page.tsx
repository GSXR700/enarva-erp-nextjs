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
    prisma.order.findMany({ 
        where: { status: 'PENDING' },
        orderBy: { date: 'desc' } 
    }),
    prisma.employee.findMany({ 
        where: { user: { role: 'FIELD_WORKER' } } 
    })
  ]);

  // CORRECTION: On gère le cas où 'mission.order' peut être null
  const initialEvents = missions.map(mission => {
    // Find the assigned employee's name using assignedToId
    const assignedEmployee = allEmployees.find(emp => emp.id === mission.assignedToId);
    const assignedName = assignedEmployee ? `${assignedEmployee.firstName}` : "Non assigné";
    // Si la mission a un titre, on l'utilise. Sinon, on construit le titre à partir de la commande.
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