// app/administration/missions/[id]/components/ObservationCard.tsx
"use client";

import { Observation } from "@prisma/client";
import Image from "next/image";
import { Info, PlusCircle, Trash2 } from "lucide-react";
import { deleteObservation } from "../../actions";
import { toast } from "sonner";

export function ObservationCard({ observations, missionId }: { observations: Observation[], missionId: string }) {
  const formatDate = (date: Date) => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));
  
  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette observation ?")) {
        const result = await deleteObservation(id);
        if (result.success) {
            toast.success("Observation supprimée.");
        } else {
            toast.error(result.error);
        }
    }
  }

  return (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold dark:text-white">Observations Terrain</h2>
            <button className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                <PlusCircle size={16} /> Ajouter
            </button>
        </div>
        <div className="bg-white dark:bg-dark-container rounded-lg shadow-lg p-6">
            <div className="space-y-6">
              {observations.length > 0 ? (
                  observations.map(obs => (
                    <div key={obs.id} className="flex items-start gap-4 group">
                      <div className="flex-shrink-0 bg-gray-200 dark:bg-dark-surface rounded-full h-10 w-10 flex items-center justify-center">
                        <Info className="h-5 w-5 text-gray-600 dark:text-dark-subtle" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800 dark:text-dark-text">{obs.content}</p>
                        <p className="text-xs text-gray-500 dark:text-dark-subtle mt-1">Signalé le {formatDate(obs.reportedAt)}</p>
                        {obs.mediaUrl && (
                          <a href={obs.mediaUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block w-40 h-32 relative">
                            <Image src={obs.mediaUrl} alt="Photo d'observation" layout="fill" objectFit="cover" className="rounded-lg border dark:border-dark-border" />
                          </a>
                        )}
                      </div>
                      <button onClick={() => handleDelete(obs.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  ))
              ) : (
                  <p className="text-center py-8 text-gray-500 dark:text-dark-subtle">Aucune observation n'a été signalée pour cette mission.</p>
              )}
            </div>
        </div>
    </div>
  );
}