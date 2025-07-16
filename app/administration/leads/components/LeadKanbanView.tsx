// app/administration/leads/components/LeadKanbanView.tsx
"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { LeadStatus } from "@prisma/client";
import { LeadWithAssignedUser } from "./LeadsPageClient";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface LeadKanbanViewProps {
  initialData: LeadWithAssignedUser[];
}

const kanbanColumns: { id: LeadStatus, title: string }[] = [
    { id: 'new_lead', title: 'Nouveau Prospect' },
    { id: 'to_qualify', title: 'À Qualifier' },
    { id: 'qualified', title: 'Qualifié' },
    { id: 'visit_scheduled', title: 'Visite Planifiée' },
    { id: 'quote_sent', title: 'Devis Envoyé' },
    { id: 'quote_accepted', title: 'Devis Accepté' },
    { id: 'client_converted', title: 'Client Converti' },
];

export const LeadKanbanView = ({ initialData }: LeadKanbanViewProps) => {
  const [leads, setLeads] = useState(initialData);
  const router = useRouter();

  useEffect(() => {
    setLeads(initialData);
  }, [initialData]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const leadToMove = leads.find(l => l.id === draggableId);
    if (!leadToMove) return;

    // Mise à jour optimiste de l'UI
    const newLeads = leads.map(l => l.id === draggableId ? { ...l, statut: destination.droppableId as LeadStatus } : l);
    setLeads(newLeads);

    // Appel API en arrière-plan
    fetch(`/api/leads/${draggableId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: destination.droppableId }),
    }).then(response => {
        if(!response.ok) {
            console.error("Failed to update lead status");
            setLeads(initialData); // En cas d'erreur, on annule le changement
        } else {
            router.refresh(); // Rafraîchit les données du serveur pour être à jour
        }
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto p-2 -mx-2">
            {kanbanColumns.map(({ id, title }) => {
                const leadsInColumn = leads.filter(lead => lead.statut === id);
                return (
                    <Droppable key={id} droppableId={id}>
                        {(provided, snapshot) => (
                            <div 
                                ref={provided.innerRef} 
                                {...provided.droppableProps}
                                className={`bg-gray-100/70 dark:bg-dark-surface rounded-lg w-80 flex-shrink-0 flex flex-col transition-colors ${snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
                            >
                                <h3 className="p-3 text-sm font-semibold text-gray-700 dark:text-dark-text border-b dark:border-dark-border sticky top-0 bg-gray-100/70 dark:bg-dark-surface rounded-t-lg backdrop-blur-sm">
                                    {title} <span className="text-xs font-normal bg-gray-200 dark:bg-dark-border px-2 py-0.5 rounded-full">{leadsInColumn.length}</span>
                                </h3>
                                <div className="p-2 space-y-2 flex-grow min-h-[100px] max-h-[calc(100vh-300px)] overflow-y-auto">
                                    {leadsInColumn.map((lead, index) => (
                                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className="bg-white dark:bg-dark-highlight-bg rounded-md p-3 shadow-sm border dark:border-dark-border hover:shadow-md"
                                                >
                                                    <Link href={`/administration/leads/${lead.id}`} className="block font-medium text-sm text-gray-900 dark:text-white hover:underline">{lead.nom}</Link>
                                                    <p className="text-xs text-gray-500 dark:text-dark-subtle mt-1">{lead.telephone || 'Pas de contact'}</p>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            </div>
                        )}
                    </Droppable>
                );
            })}
        </div>
    </DragDropContext>
  );
};