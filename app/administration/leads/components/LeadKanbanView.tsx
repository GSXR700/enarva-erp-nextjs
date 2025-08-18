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

// 🔧 CORRECTION: Remplacement de 'client_converted' par 'qualified' 
// car dans votre logique métier, un lead qualifié = converti en client potentiel
const kanbanColumns: { id: LeadStatus, title: string }[] = [
    { id: 'new_lead', title: 'Nouveau Prospect' },
    { id: 'to_qualify', title: 'À Qualifier' },
    { id: 'qualified', title: 'Qualifié' },
    { id: 'visit_scheduled', title: 'Visite Planifiée' },
    { id: 'quote_sent', title: 'Devis Envoyé' },
    { id: 'quote_accepted', title: 'Devis Accepté' },
    { id: 'client_confirmed', title: 'Client Confirmé' }, // 🔧 CORRECTION: Utilise le bon enum
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
                                className={`bg-gray-100/70 dark:bg-dark-surface rounded-lg w-80 flex-shrink-0 flex flex-col transition-colors ${
                                    snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                }`}
                            >
                                <div className="p-4 border-b border-gray-200 dark:border-dark-border">
                                    <h3 className="font-semibold text-gray-700 dark:text-dark-text">{title}</h3>
                                    <span className="text-sm text-gray-500 dark:text-dark-subtle">
                                        {leadsInColumn.length} prospect{leadsInColumn.length > 1 ? 's' : ''}
                                    </span>
                                </div>
                                
                                <div className="flex-1 p-2 space-y-2 min-h-[200px]">
                                    {leadsInColumn.map((lead, index) => (
                                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className={`bg-white dark:bg-dark-container p-3 rounded-md shadow-sm border transition-all ${
                                                        snapshot.isDragging 
                                                            ? 'shadow-lg rotate-3 border-blue-300' 
                                                            : 'hover:shadow-md border-gray-200 dark:border-dark-border'
                                                    }`}
                                                >
                                                    <Link href={`/administration/leads/${lead.id}`}>
                                                        <div>
                                                            <h4 className="font-medium text-gray-800 dark:text-dark-text text-sm mb-1">
                                                                {lead.nom}
                                                            </h4>
                                                            <p className="text-xs text-gray-600 dark:text-dark-subtle mb-2">
                                                                {lead.telephone || 'Pas de téléphone'}
                                                            </p>
                                                            {lead.quoteObject && (
                                                                <p className="text-xs text-gray-500 dark:text-dark-subtle truncate">
                                                                    {lead.quoteObject}
                                                                </p>
                                                            )}
                                                            {lead.assignedTo && (
                                                                <div className="mt-2 flex items-center">
                                                                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                                        <span className="text-xs text-white font-medium">
                                                                            {lead.assignedTo.name?.charAt(0) || '?'}
                                                                        </span>
                                                                    </div>
                                                                    <span className="ml-1 text-xs text-gray-600 dark:text-dark-subtle">
                                                                        {lead.assignedTo.name}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </Link>
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