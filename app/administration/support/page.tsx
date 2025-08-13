// app/administration/support/page.tsx
import prisma from "@/lib/prisma";
import { SupportPageClient } from "./components/SupportPageClient";

export const dynamic = 'force-dynamic';

export default async function SupportPage() {

    const [savTickets, maintenanceTickets, clients, missions, equipments, employees] = await Promise.all([
        prisma.ticketSAV.findMany({
            include: { client: true, mission: { select: { workOrderNumber: true } } },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.maintenanceTicket.findMany({
            include: { equipment: true, reportedBy: { select: { firstName: true, lastName: true } } },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.client.findMany({ orderBy: { nom: 'asc' } }),
        prisma.mission.findMany({ where: { status: 'COMPLETED' }, select: { id: true, workOrderNumber: true, order: { select: { client: { select: { nom: true } } } } }, orderBy: { scheduledStart: 'desc' } }),
        prisma.equipment.findMany({ orderBy: { name: 'asc' } }),
        prisma.employee.findMany({ orderBy: { lastName: 'asc' } })
    ]);

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">
                    Support & Maintenance
                </h1>
            </div>
            <SupportPageClient
                initialSavTickets={savTickets}
                initialMaintenanceTickets={maintenanceTickets}
                clients={clients}
                missions={missions}
                equipments={equipments}
                employees={employees}
            />
        </div>
    );
}