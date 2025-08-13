// app/administration/support/components/MaintenanceTicketList.tsx
"use client";

import { useState } from "react";
import type { MaintenanceTicket, Equipment, Employee } from "@prisma/client";
import { MaintenanceTicketFormModal } from "./MaintenanceTicketFormModal";
import { PlusCircle, Edit } from "lucide-react";

type FullMaintenanceTicket = MaintenanceTicket & {
    equipment: Equipment;
    reportedBy: { firstName: string | null; lastName: string | null; } | null;
};

export function MaintenanceTicketList({ tickets, equipments, employees }: { tickets: FullMaintenanceTicket[], equipments: Equipment[], employees: Employee[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTicket, setEditingTicket] = useState<FullMaintenanceTicket | null>(null);

    const handleOpenModal = (ticket: FullMaintenanceTicket | null = null) => {
        setEditingTicket(ticket);
        setIsModalOpen(true);
    };

    const getStatusBadge = (status: string) => {
        const baseClasses = "px-2 py-0.5 text-xs font-medium rounded-full";
        switch (status) {
            case 'OPEN': return <span className={`${baseClasses} bg-red-100 text-red-800`}>Ouvert</span>;
            case 'IN_PROGRESS': return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>En Cours</span>;
            case 'RESOLVED': return <span className={`${baseClasses} bg-green-100 text-green-800`}>Résolu</span>;
            case 'CLOSED': return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Clos</span>;
            default: return null;
        }
    };

    const getPriorityBadge = (priority: string) => {
        const baseClasses = "px-2 py-0.5 text-xs font-medium rounded-full";
        switch (priority) {
            case 'LOW': return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Basse</span>;
            case 'MEDIUM': return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Moyenne</span>;
            case 'HIGH': return <span className={`${baseClasses} bg-orange-100 text-orange-800`}>Haute</span>;
            case 'CRITICAL': return <span className={`${baseClasses} bg-red-100 text-red-800`}>Critique</span>;
            default: return null;
        }
    }

    return (
        <>
            <div className="flex justify-end mb-4">
                <button onClick={() => handleOpenModal()} className="flex items-center gap-2 text-sm font-medium text-white bg-primary px-4 py-2 rounded-lg hover:opacity-90">
                    <PlusCircle size={18} />
                    <span>Nouveau Ticket Maintenance</span>
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b dark:border-dark-border">
                        <tr>
                            <th className="p-4 text-sm font-medium text-gray-500">N° Ticket</th>
                            <th className="p-4 text-sm font-medium text-gray-500">Équipement</th>
                            <th className="p-4 text-sm font-medium text-gray-500">Signalé par</th>
                            <th className="p-4 text-sm font-medium text-gray-500">Priorité</th>
                            <th className="p-4 text-sm font-medium text-gray-500">Statut</th>
                            <th className="p-4 text-sm font-medium text-gray-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-dark-border">
                        {tickets.map((ticket) => (
                            <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                <td className="p-4 font-semibold">{ticket.ticketNumber}</td>
                                <td className="p-4">{ticket.equipment.name}</td>
                                <td className="p-4">{`${ticket.reportedBy?.firstName} ${ticket.reportedBy?.lastName}`}</td>
                                <td className="p-4">{getPriorityBadge(ticket.priority)}</td>
                                <td className="p-4">{getStatusBadge(ticket.status)}</td>
                                <td className="p-4 text-right">
                                    <button onClick={() => handleOpenModal(ticket)} className="text-blue-600 hover:text-blue-800">
                                        <Edit size={16}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {tickets.length === 0 && <p className="p-4 text-center text-sm text-gray-400">Aucun ticket de maintenance trouvé.</p>}
            </div>
            <MaintenanceTicketFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                ticket={editingTicket}
                equipments={equipments}
                employees={employees}
            />
        </>
    );
}