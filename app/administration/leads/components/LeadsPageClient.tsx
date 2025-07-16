// app/administration/leads/components/LeadsPageClient.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutGrid, List, Plus } from "lucide-react";
import { Lead, User } from "@prisma/client";
import { LeadList } from "./LeadList";
import { LeadKanbanView } from "./LeadKanbanView";

// This type now correctly reflects the data structure from the server action
export type LeadWithAssignedUser = Lead & {
  assignedTo: {
    name: string | null;
    image: string | null;
  } | null;
};

interface LeadsPageClientProps {
  leads: LeadWithAssignedUser[];
  users: User[];
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const LeadsPageClient = ({ 
  leads, 
  users, // We keep this prop here, as it will be needed for the "Add Lead" form
  totalItems, 
  itemsPerPage, 
  hasNextPage, 
  hasPrevPage 
}: LeadsPageClientProps) => {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  return (
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
            <button title="Vue Liste" onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-border'}`}>
                <List className="h-5 w-5"/>
            </button>
            <button title="Vue Kanban" onClick={() => setViewMode('kanban')} className={`p-2 rounded-md ${viewMode === 'kanban' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-border'}`}>
                <LayoutGrid className="h-5 w-5"/>
            </button>
            <div className="w-px h-8 bg-gray-200 dark:bg-dark-border mx-2"></div>
            {/* The "Add" button will eventually open a modal that WILL use the `users` prop */}
            <Link href="/administration/leads/new" className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-10 py-2 px-4">
              <Plus className="mr-2 h-4 w-4" /> Ajouter
            </Link>
        </div>
      </div>

      {viewMode === 'list' ? (
        <LeadList 
          data={leads}
          // CORRECTION: The `users` prop is removed from here
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
        />
      ) : (
        <LeadKanbanView initialData={leads} />
      )}
    </div>
  );
};