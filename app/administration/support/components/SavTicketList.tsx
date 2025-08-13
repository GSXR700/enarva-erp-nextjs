// app/administration/support/components/SavTicketList.tsx
"use client";

import { useState } from "react";
import type { TicketSAV, Client, Mission } from "@prisma/client";
import { SavTicketFormModal } from "./SavTicketFormModal";
import { PlusCircle, Edit } from "lucide-react";

type FullTicketSAV = TicketSAV & {
    client: Client;
    mission: { workOrderNumber: string | null } | null;
};

export function SavTicketList({ tickets, clients, missions }: { tickets: FullTicketSAV[], clients: Client[], missions: any[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTicket, setEditingTicket] = useState<FullTicketSAV | null>(null);

    const handleOpenModal = (ticket: FullTicketSAV | null = null) => {
        setEditingTicket(ticket);
        setIsModalOpen(true);
    };

    const getStatusBadge = (status: string) => {
        const baseClasses = "px-2 py-0.5 text-xs font-medium rounded-full";
        switch (status) {
            case 'OUVERT': return <span className={`${baseClasses} bg-red-100 text-red-800`}>Ouvert</span>;
            case 'EN_COURS_ANALYSE': return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>En Analyse</span>;
            case 'ACTION_PROPOSEE': return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Action Proposée</span>;
            case 'RESOLU': return <span className={`${baseClasses} bg-green-100 text-green-800`}>Résolu</span>;
            case 'CLOS': return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Clos</span>;
            default: return null;
        }
    };

    return (
        <>
            <div className="flex justify-end mb-4">
                <button onClick={() => handleOpenModal()} className="flex items-center gap-2 text-sm font-medium text-white bg-primary px-4 py-2 rounded-lg hover:opacity-90">
                    <PlusCircle size={18} />
                    <span>Nouveau Ticket SAV</span>
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b dark:border-dark-border">
                        <tr>
                            <th className="p-4 text-sm font-medium text-gray-500">N° Ticket</th>
                            <th className="p-4 text-sm font-medium text-gray-500">Client</th>
                            <th className="p-4 text-sm font-medium text-gray-500">Raison</th>
                            <th className="p-4 text-sm font-medium text-gray-500">Statut</th>
                            <th className="p-4 text-sm font-medium text-gray-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-dark-border">
                        {tickets.map((ticket) => (
                            <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                <td className="p-4 font-semibold">{ticket.ticketNumber}</td>
                                <td className="p-4">{ticket.client.nom}</td>
                                <td className="p-4">{ticket.raison}</td>
                                <td className="p-4">{getStatusBadge(ticket.statut)}</td>
                                <td className="p-4 text-right">
                                    <button onClick={() => handleOpenModal(ticket)} className="text-blue-600 hover:text-blue-800">
                                        <Edit size={16}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {tickets.length === 0 && <p className="p-4 text-center text-sm text-gray-400">Aucun ticket SAV trouvé.</p>}
            </div>
            <SavTicketFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                ticket={editingTicket}
                clients={clients}
                missions={missions}
            />
        </>
    );
}