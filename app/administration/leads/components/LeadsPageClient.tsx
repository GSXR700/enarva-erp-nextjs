// app/administration/leads/components/LeadsPageClient.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutGrid, List, Plus } from "lucide-react";
import { Lead, User, Subcontractor } from "@prisma/client";
import { LeadList } from "./LeadList";
import { LeadKanbanView } from "./LeadKanbanView";
import { LeadFormModal } from "./modals/LeadFormModal"; // We will create this modal

export type LeadWithAssignedUser = Lead & {
  assignedTo: {
    name: string | null;
    image: string | null;
  } | null;
  subcontractorAsSource: {
      name: string | null;
  } | null;
};

interface LeadsPageClientProps {
  leads: LeadWithAssignedUser[];
  users: User[];
  subcontractors: Subcontractor[];
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const LeadsPageClient = ({
  leads,
  users,
  subcontractors,
  totalItems,
  itemsPerPage,
  hasNextPage,
  hasPrevPage
}: LeadsPageClientProps) => {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <LeadFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        users={users}
        subcontractors={subcontractors}
      />
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Gestion des Prospects
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-dark-subtle">
              Suivez vos opportunités de la prise de contact à la conversion.
            </p>
          </div>
          <div className="flex items-center space-x-2">
              <button title="Vue Liste" onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-100' : 'text-gray-500 hover:bg-gray-100'}`}>
                  <List className="h-5 w-5"/>
              </button>
              <button title="Vue Kanban" onClick={() => setViewMode('kanban')} className={`p-2 rounded-md ${viewMode === 'kanban' ? 'bg-blue-100' : 'text-gray-500 hover:bg-gray-100'}`}>
                  <LayoutGrid className="h-5 w-5"/>
              </button>
              <div className="w-px h-8 bg-gray-200 mx-2"></div>
              <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-white hover:bg-primary/90 h-10 py-2 px-4">
                <Plus className="mr-2 h-4 w-4" /> Ajouter
              </button>
          </div>
        </div>

        {viewMode === 'list' ? (
          <LeadList
            data={leads}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
          />
        ) : (
          <LeadKanbanView initialData={leads} />
        )}
      </div>
    </>
  );
};