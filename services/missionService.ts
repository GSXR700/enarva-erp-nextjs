// enarva-nextjs-dashboard-app/services/missionService.ts
import prisma from "@/lib/prisma";
import { Employee, Order, MissionStatus, User, Prisma } from "@prisma/client";
import { createAndEmitNotification } from "@/lib/notificationService";

// Type pour le client Prisma (soit global, soit transactionnel)
type PrismaClient = Omit<Prisma.TransactionClient, "$commit" | "$rollback">;

type EmployeeWithDetails = Employee & {
  missions: { scheduledEnd: Date }[];
  user: User | null;
};

async function findLeastBusyEmployee(tx: PrismaClient): Promise<EmployeeWithDetails | null> {
  const employees = await tx.employee.findMany({
    include: {
      user: true, 
      missions: {
        where: {
          status: { in: [MissionStatus.PENDING, MissionStatus.IN_PROGRESS] },
        },
        orderBy: { scheduledEnd: 'desc' }
      },
    },
  });

  if (employees.length === 0) return null;

  return employees.reduce((prev, curr) => 
    (prev.missions.length < curr.missions.length) ? prev : curr
  );
}

function getNextAvailableSlot(employee: EmployeeWithDetails): Date {
    const lastMission = employee.missions[0]; 
    if (!lastMission) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(8, 0, 0, 0);
        return tomorrow;
    }
    let nextStart = new Date(lastMission.scheduledEnd);
    if (nextStart.getHours() >= 18) {
        nextStart.setDate(nextStart.getDate() + 1);
        nextStart.setHours(8, 0, 0, 0);
    }
    return nextStart;
}

export async function createMissionsFromOrder(order: Order, tx: PrismaClient) { // Accepte le client de transaction
  console.log(`Début de la création de mission pour la commande ${order.orderNumber}...`);

  const bestEmployee = await findLeastBusyEmployee(tx);

  if (!bestEmployee) {
    throw new Error("Aucun employé disponible trouvé. Impossible d'assigner la mission.");
  }

  console.log(`Employé le moins chargé trouvé: ${bestEmployee.firstName} avec ${bestEmployee.missions.length} mission(s) active(s).`);

  const client = await tx.client.findUnique({ where: { id: order.clientId }});
  if (!client) {
    throw new Error(`Client avec ID ${order.clientId} introuvable.`);
  }

  const scheduledStart = getNextAvailableSlot(bestEmployee);
  const scheduledEnd = new Date(scheduledStart.getTime() + 2 * 60 * 60 * 1000);

  console.log(`Créneau trouvé : de ${scheduledStart.toLocaleString('fr-FR')} à ${scheduledEnd.toLocaleString('fr-FR')}`);

  const mission = await tx.mission.create({
    data: {
      orderId: order.id,
      assignedToId: bestEmployee.id,
      scheduledStart,
      scheduledEnd,
      status: 'PENDING',
      notes: `Mission générée et planifiée automatiquement pour la commande client ${order.refCommande}.`
    }
  });

  if (bestEmployee.user) {
    await createAndEmitNotification({
      userId: bestEmployee.user.id,
      message: `Nouvelle mission assignée : Commande <b>${order.orderNumber}</b> chez <b>${client.name}</b>.`,
      link: `/mobile` 
    });
  }

  console.log(`Mission ${mission.id} créée et notifiée à ${bestEmployee.firstName}.`);
  return mission;
}