// app/administration/missions/components/MissionList.tsx
"use client";

import type { Mission } from "@prisma/client";
import { useRouter } from "next/navigation";
import { deleteMission } from "../actions";
import { toast } from "sonner";
import { Edit, Trash2, Eye } from "lucide-react";
import { MissionWithDetails } from "../page";

interface MissionListProps {
  missions: MissionWithDetails[];
  onEdit: (mission: Mission) => void;
}

export function MissionList({ missions, onEdit }: MissionListProps) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette mission ?")) {
        const result = await deleteMission(id);
        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2.5 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case 'PENDING': return <span className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`}>En attente</span>;
      case 'IN_PROGRESS': return <span className={`${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`}>En cours</span>;
      case 'APPROBATION': return <span className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`}>En Approbation</span>;
      case 'COMPLETED': return <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`}>Approuvée</span>;
      case 'VALIDATED': return <span className={`${baseClasses} bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300`}>Validée & Facturée</span>;
      case 'CANCELLED': return <span className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`}>Annulée</span>;
      default: return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="border-b dark:border-dark-border">
          <tr>
            <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Mission / Client</th>
            <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Employé Assigné</th>
            <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Date de Début Planifiée</th>
            <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Statut</th>
            <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
          {missions.map((mission) => (
            <tr key={mission.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
              <td className="p-4">
                <div className="font-semibold text-gray-800 dark:text-dark-text">
                  {mission.order ? mission.order.orderNumber : (mission.title || "Mission Spéciale")}
                </div>
                {mission.order && (
                  <div className="text-xs text-gray-500 dark:text-dark-subtle">
                    {mission.order.client.nom}
                  </div>
                )}
              </td>
              <td className="p-4 text-sm text-gray-600 dark:text-dark-subtle">
                {mission.assignedTo ? `${mission.assignedTo.firstName} ${mission.assignedTo.lastName}` : "Non assigné"}
              </td>
              <td className="p-4 text-sm text-gray-600 dark:text-dark-subtle">{new Date(mission.scheduledStart).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</td>
              <td className="p-4">{getStatusBadge(mission.status)}</td>
              <td className="p-4">
                <div className="flex items-center justify-center gap-2">
                    <button onClick={() => router.push(`/administration/missions/${mission.id}`)} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Afficher la mission">
                        <Eye className="h-4 w-4" />
                    </button>
                    <button onClick={() => onEdit(mission)} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Modifier la mission">
                        <Edit className="h-4 w-4 text-blue-500" />
                    </button>
                    <button onClick={() => handleDelete(mission.id)} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Supprimer la mission">
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {missions.length === 0 && (
          <p className="py-8 text-center text-gray-500 dark:text-dark-subtle">Aucune mission trouvée.</p>
      )}
    </div>
  );
}