// app/administration/leads/[leadId]/components/LeadDetails.tsx
import { Lead } from "@prisma/client";
import { Mail, Phone } from "lucide-react";

const DetailItem = ({ label, value, icon }: { label: string, value: string | null | undefined, icon?: React.ReactNode }) => (
    <div>
        <dt className="text-sm font-medium text-gray-500 dark:text-dark-subtle flex items-center">{icon && <span className="mr-2">{icon}</span>}{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{value || "Non spécifié"}</dd>
    </div>
);

export const LeadDetails = ({ lead }: { lead: Lead }) => {
    return (
        <div className="bg-white dark:bg-dark-surface shadow-sm rounded-lg p-6">
             <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Détails du Prospect</h3>
             <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                <DetailItem label="Email" value={lead.email} icon={<Mail size={14}/>} />
                <DetailItem label="Téléphone" value={lead.telephone} icon={<Phone size={14}/>} />
                <div className="md:col-span-2">
                    <DetailItem label="Commentaires" value={lead.commentaire} />
                </div>
             </dl>
        </div>
    );
}