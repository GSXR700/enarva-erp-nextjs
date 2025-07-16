// app/administration/leads/[leadId]/components/LeadActivity.tsx
import { Lead } from "@prisma/client";

export const LeadActivity = ({ lead }: { lead: { assignedTo?: { name: string | null } | null } & Lead }) => {
    return (
         <div className="bg-white dark:bg-dark-surface shadow-sm rounded-lg p-6">
             <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Informations Clés</h3>
             <dl className="space-y-3">
                <div className="text-sm">
                    <dt className="text-gray-500 dark:text-dark-subtle">Responsable</dt>
                    <dd className="text-gray-900 dark:text-white">{lead.assignedTo?.name || "Non assigné"}</dd>
                </div>
                 <div className="text-sm">
                    <dt className="text-gray-500 dark:text-dark-subtle">Créé le</dt>
                    <dd className="text-gray-900 dark:text-white">{new Date(lead.date_creation).toLocaleDateString('fr-FR')}</dd>
                </div>
                 <div className="text-sm">
                    <dt className="text-gray-500 dark:text-dark-subtle">Dernière activité</dt>
                    <dd className="text-gray-900 dark:text-white">{new Date(lead.date_derniere_action).toLocaleDateString('fr-FR')}</dd>
                </div>
             </dl>
         </div>
    )
}