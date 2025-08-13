// app/administration/support/components/MaintenanceTicketFormModal.tsx
"use client";

import { useState, useRef } from "react";
import type { MaintenanceTicket, Equipment, Employee } from "@prisma/client";
import { TicketStatus, TicketPriority } from "@prisma/client";
import { saveMaintenanceTicket } from "../actions";
import { Loader2 } from "lucide-react";

interface MaintenanceTicketFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticket: (MaintenanceTicket & { equipment: Equipment, reportedBy: { firstName: string | null, lastName: string | null } | null }) | null;
    equipments: Equipment[];
    employees: Employee[];
}

export function MaintenanceTicketFormModal({ isOpen, onClose, ticket, equipments, employees }: MaintenanceTicketFormModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    if (!isOpen) return null;

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(event.currentTarget);
        const data = {
            id: formData.get("id") as string || undefined,
            equipmentId: formData.get("equipmentId") as string,
            reportedById: formData.get("reportedById") as string,
            description: formData.get("description") as string,
            priority: formData.get("priority") as TicketPriority,
            status: formData.get("status") as TicketStatus,
        };

        const result = await saveMaintenanceTicket(data);
        if (result.success) {
            onClose();
        } else {
            alert(result.error);
        }
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
            <div className="w-full max-w-2xl m-4 bg-white rounded-lg shadow-xl dark:bg-dark-container">
                <form ref={formRef} onSubmit={handleSubmit}>
                    <div className="p-4 border-b flex justify-between items-center">
                        <h3 className="text-xl font-semibold">{ticket ? "Modifier le Ticket" : "Nouveau Ticket de Maintenance"}</h3>
                        <button type="button" onClick={onClose} className="text-3xl">&times;</button>
                    </div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <input type="hidden" name="id" defaultValue={ticket?.id || ""} />
                        <div>
                            <label htmlFor="equipmentId" className="block text-sm font-medium mb-1">Équipement concerné</label>
                            <select id="equipmentId" name="equipmentId" defaultValue={ticket?.equipmentId || ""} className="w-full p-2 border rounded" required>
                                <option value="">Sélectionner un équipement</option>
                                {equipments.map(e => <option key={e.id} value={e.id}>{e.name} ({e.serialNumber || 'N/A'})</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="reportedById" className="block text-sm font-medium mb-1">Signalé par</label>
                            <select id="reportedById" name="reportedById" defaultValue={ticket?.reportedById || ""} className="w-full p-2 border rounded" required>
                                <option value="">Sélectionner un employé</option>
                                {employees.map(e => <option key={e.id} value={e.id}>{`${e.firstName} ${e.lastName}`}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium mb-1">Description du problème</label>
                            <textarea id="description" name="description" defaultValue={ticket?.description || ""} rows={4} className="w-full p-2 border rounded" required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="priority" className="block text-sm font-medium mb-1">Priorité</label>
                                <select id="priority" name="priority" defaultValue={ticket?.priority || TicketPriority.MEDIUM} className="w-full p-2 border rounded">
                                    {Object.values(TicketPriority).map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            {ticket && (
                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium mb-1">Statut</label>
                                    <select id="status" name="status" defaultValue={ticket.status} className="w-full p-2 border rounded">
                                        {Object.values(TicketStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Annuler</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50 flex items-center">
                            {isSubmitting && <Loader2 className="animate-spin mr-2"/>}
                            {ticket ? "Enregistrer" : "Créer le Ticket"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}