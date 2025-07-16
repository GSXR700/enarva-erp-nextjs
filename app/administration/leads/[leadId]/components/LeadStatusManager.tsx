// app/administration/leads/[leadId]/components/LeadStatusManager.tsx
"use client";
import { Lead, LeadStatus as LeadStatusEnum } from "@prisma/client";

export const LeadStatusManager = ({ lead }: { lead: Lead }) => {
    return (
        <div className="bg-white dark:bg-dark-surface shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Statut</h3>
            <select defaultValue={lead.statut} className="w-full p-2 border rounded-md bg-transparent dark:bg-dark-surface dark:border-dark-border focus:ring-primary focus:border-primary">
                {Object.values(LeadStatusEnum).map(status => (
                    <option key={status} value={status}>{status}</option>
                ))}
            </select>
            <button className="w-full mt-3 h-10 py-2 px-4 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700">
                Mettre à jour le statut
            </button>
        </div>
    );
};