"use client";

import { useState } from "react";
import type { Mission, Subcontractor } from "@prisma/client";
import { updateSubcontractingStatus } from "../../actions/subcontractingActions";
import { Truck, Check, Loader2 } from "lucide-react";

type SubcontractingCardProps = {
  mission: Mission & { subcontractor: Subcontractor | null };
  onAssign: () => void;
};

export function SubcontractingCard({ mission, onAssign }: SubcontractingCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusUpdate = async (status: 'sent' | 'returned') => {
    setIsLoading(true);
    await updateSubcontractingStatus(mission.id, status);
    // Le revalidatePath dans l'action rafraîchira les données, donc pas besoin de setState ici.
    setIsLoading(false);
  };

  const formatDate = (date: Date | null) => date ? new Date(date).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }) : 'En attente';

  return (
    <div className="bg-white dark:bg-dark-container rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg dark:text-white">Suivi de la Sous-traitance</h3>
        {!mission.subcontractor && (
          <button onClick={onAssign} className="text-sm font-medium text-primary hover:opacity-80">
            Assigner un partenaire
          </button>
        )}
      </div>

      {mission.subcontractor ? (
        <div>
          <p className="text-sm dark:text-dark-text mb-4">Partenaire: <strong className="font-semibold">{mission.subcontractor.name}</strong></p>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${mission.sentToSubcontractorAt ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                  <Truck size={16}/>
                </div>
                <div>
                  <p className="text-sm font-medium dark:text-dark-text">Envoyé au Partenaire</p>
                  <p className="text-xs text-gray-500 dark:text-dark-subtle">{formatDate(mission.sentToSubcontractorAt)}</p>
                </div>
              </div>

              {!mission.sentToSubcontractorAt && (
                <button onClick={() => handleStatusUpdate('sent')} disabled={isLoading} className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">
                   {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Valider Envoi"}
                </button>
              )}
            </div>
             <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <div className={`h-8 w-8 rounded-full flex items-center justify-center ${mission.returnedFromSubcontractorAt ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  <Check size={16}/>
                </div>
                <div>
                  <p className="text-sm font-medium dark:text-dark-text">Réceptionné du Partenaire</p>
                  <p className="text-xs text-gray-500 dark:text-dark-subtle">{formatDate(mission.returnedFromSubcontractorAt)}</p>
                </div>
              </div>
              {mission.sentToSubcontractorAt && !mission.returnedFromSubcontractorAt && (
                 <button onClick={() => handleStatusUpdate('returned')} disabled={isLoading} className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50">
                   {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Valider Réception"}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-dark-subtle">Aucun sous-traitant n'est assigné à cette mission.</p>
      )}
    </div>
  );
}