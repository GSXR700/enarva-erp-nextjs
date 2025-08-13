// app/administration/leads/[leadId]/edit/EditLeadClientPage.tsx
"use client";

import { useRouter } from "next/navigation";
import { LeadForm } from "../../components/LeadForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Lead, User, Subcontractor } from "@prisma/client";

interface EditLeadClientPageProps {
    lead: Lead;
    users: User[];
    subcontractors: Subcontractor[];
}

export function EditLeadClientPage({ lead, users, subcontractors }: EditLeadClientPageProps) {
    const router = useRouter();

    return (
        <div className="space-y-6">
            <div>
                <Link href="/administration/leads" className="flex items-center text-sm text-gray-500 dark:text-dark-subtle mb-4 hover:underline">
                    <ChevronLeft className="h-4 w-4 mr-1"/>
                    Retour à la liste des prospects
                </Link>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Modifier le Prospect</h1>
                <p className="text-sm text-gray-500 dark:text-dark-subtle">Mettez à jour les informations de "{lead.nom}".</p>
            </div>
            <div className="p-4 md:p-6 bg-white dark:bg-dark-surface rounded-lg shadow-sm">
                <LeadForm
                    initialData={JSON.parse(JSON.stringify(lead))}
                    users={users}
                    subcontractors={subcontractors}
                    onFormSubmit={() => {
                        // This function is now correctly passed from a Client Component
                        // and will redirect the user after a successful update.
                        router.push('/administration/leads');
                    }}
                />
            </div>
        </div>
    );
}