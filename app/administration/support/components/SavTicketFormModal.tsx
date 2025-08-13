// app/administration/support/components/SavTicketFormModal.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { TicketSAV, Client, Mission, TicketSAVStatus } from "@prisma/client";
import { saveSavTicket } from "../actions";
import { Loader2 } from "lucide-react";

interface SavTicketFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticket: (TicketSAV & { client: Client }) | null;
    clients: Client[];
    missions: any[];
}

export function SavTicketFormModal({ isOpen, onClose, ticket, clients, missions }: SavTicketFormModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const [selectedClient, setSelectedClient] = useState<string>(ticket?.clientId || "");

    useEffect(() => {
        if (ticket) {
            setSelectedClient(ticket.clientId);
        } else {
            setSelectedClient("");
        }
    }, [ticket]);

    const filteredMissions = missions.filter(m => m.order?.client?.nom === clients.find(c => c.id === selectedClient)?.nom);

    if (!isOpen) return null;

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(event.currentTarget);
        const data = {
            id: formData.get("id") as string || undefined,
            clientId: formData.get("clientId") as string,
            missionId: formData.get("missionId") as string,
            raison: formData.get("raison") as string,
            description: formData.get("description") as string,
            statut: formData.get("statut") as TicketSAVStatus,
        };

        const result = await saveSavTicket(data);
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
                        <h3 className="text-xl font-semibold">{ticket ? "Modifier le Ticket SAV" : "Nouveau Ticket SAV"}</h3>
                        <button type="button" onClick={onClose} className="text-3xl">&times;</button>
                    </div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <input type="hidden" name="id" defaultValue={ticket?.id || ""} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="clientId" className="block text-sm font-medium mb-1">Client</label>
                                <select id="clientId" name="clientId" value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} className="w-full p-2 border rounded" required>
                                    <option value="">Sélectionner un client</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="missionId" className="block text-sm font-medium mb-1">Mission Concernée</label>
                                <select id="missionId" name="missionId" defaultValue={ticket?.missionId || ""} className="w-full p-2 border rounded" disabled={!selectedClient} required>
                                    <option value="">Sélectionner une mission</option>
                                    {filteredMissions.map(m => <option key={m.id} value={m.id}>{m.workOrderNumber || m.id}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="raison" className="block text-sm font-medium mb-1">Raison du Ticket</label>
                            <input id="raison" name="raison" defaultValue={ticket?.raison || ""} className="w-full p-2 border rounded" required />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium mb-1">Description détaillée</label>
                            <textarea id="description" name="description" defaultValue={ticket?.description || ""} rows={4} className="w-full p-2 border rounded" required />
                        </div>
                        {ticket && (
                            <div>
                                <label htmlFor="statut" className="block text-sm font-medium mb-1">Statut</label>
                                <select id="statut" name="statut" defaultValue={ticket.statut} className="w-full p-2 border rounded">
                                    {Object.values(TicketSAVStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        )}
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