// app/administration/leads/components/CellAction.tsx
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, Edit, Trash, ArrowRight } from "lucide-react";
import { Lead, LeadStatus } from "@prisma/client"; // IMPORT NÉCESSAIRE
import { useModal } from "@/hooks/use-modal-store";

interface CellActionProps {
  data: Lead;
}

export const CellAction = ({ data }: CellActionProps) => {
  const router = useRouter();
  const { onOpen } = useModal();

  const onDelete = async () => {
    // ... (la logique de suppression reste inchangée)
  };

  return (
    <div className="flex items-center space-x-1">
      {/* ... (les liens Voir et Modifier restent inchangés) */}

      {/* CORRECTION : On compare avec la bonne valeur de l'énumération */}
      {data.statut !== LeadStatus.client_converted && (
        <button
          onClick={() => onOpen("convertLead", { lead: data })}
          className="p-2 rounded-md text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20" 
          title="Convertir en Devis"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      )}

      {/* ... (le bouton Supprimer reste inchangé) */}
    </div>
  );
};