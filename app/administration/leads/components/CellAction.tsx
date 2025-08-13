// app/administration/leads/components/CellAction.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Edit, Trash, FilePlus2, Eye } from "lucide-react";
import { Lead, LeadStatus } from "@prisma/client";
import { useModal } from "@/hooks/use-modal-store";
import { toast } from "sonner";

interface CellActionProps {
  data: Lead;
}

export const CellAction = ({ data }: CellActionProps) => {
  const router = useRouter();
  const { onOpen } = useModal();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-1 w-48 bg-white dark:bg-dark-surface rounded-md shadow-lg border dark:border-dark-border z-10"
          onMouseLeave={() => setIsOpen(false)}
        >
          <ul className="py-1">
            <li>
              <button
                onClick={() => router.push(`/administration/leads/${data.id}`)}
                className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-highlight-bg"
              >
                <Eye className="h-4 w-4" />
                <span>Voir</span>
              </button>
            </li>
            <li>
              {/* --- THIS IS THE FIX --- */}
              <button
                onClick={() => router.push(`/administration/leads/${data.id}/edit`)}
                className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-highlight-bg"
              >
                <Edit className="h-4 w-4" />
                <span>Modifier</span>
              </button>
            </li>
            {data.statut !== LeadStatus.qualified && (
              <li>
                <button
                  onClick={() => onOpen("convertLead", { lead: data })}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-dark-highlight-bg"
                >
                  <FilePlus2 className="h-4 w-4" />
                  <span>Devis</span>
                </button>
              </li>
            )}
            <li>
              <div className="my-1 h-px bg-gray-100 dark:bg-dark-border" />
            </li>
            <li>
              <button
                onClick={() => onOpen("deleteLead", { lead: data })}
                className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-dark-highlight-bg"
              >
                <Trash className="h-4 w-4" />
                <span>Supprimer</span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};