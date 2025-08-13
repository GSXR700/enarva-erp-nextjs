// app/services/missionService.ts

import { Order, Prisma } from "@prisma/client";

/**
 * Creates one or more missions based on the details of a confirmed order.
 * This function is designed to be called from within a Prisma transaction.
 * @param order - The order object for which to create missions.
 * @param tx - The Prisma transaction client.
 */
export async function createMissionsFromOrder(
  order: Order,
  tx: Prisma.TransactionClient
) {
  // Basic validation
  if (!order.clientId) {
    throw new Error("Client ID is missing from the order.");
  }

  // For now, we create one single mission per order.
  // In the future, this logic could be expanded to create multiple missions
  // based on the items or services in the order.

  // A default employee must be assigned. In a real scenario, this could be
  // determined by availability, skills, or a manager's manual assignment.
  // We'll fetch the first available FIELD_WORKER for this example.
  const fieldWorker = await tx.employee.findFirst({
    where: { user: { role: 'FIELD_WORKER' } },
  });

  if (!fieldWorker) {
    // If no field worker is available, the mission cannot be created.
    // The transaction will be rolled back.
    throw new Error("No available field worker to assign the mission to. Please add an employee with the FIELD_WORKER role.");
  }

  // Create the mission
  await tx.mission.create({
    data: {
      title: `Mission pour commande ${order.orderNumber}`,
      orderId: order.id,
      assignedToId: fieldWorker.id, // Assign to the found field worker
      status: 'PENDING',
      // Schedule the mission to start 24 hours from now by default.
      // This should be adjusted based on business rules or user input.
      scheduledStart: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
      // End time can be calculated based on the start time or service duration
      scheduledEnd: new Date(new Date().getTime() + (24 + 8) * 60 * 60 * 1000), // Example: 8-hour duration
    },
  });
}