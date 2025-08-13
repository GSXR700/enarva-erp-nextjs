// app/administration/leads/components/modals/LeadFormModal.tsx
"use client";

import { LeadForm } from "../LeadForm";
import type { User, Subcontractor, Lead } from "@prisma/client";

interface LeadFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    users: User[];
    subcontractors: Subcontractor[];
    initialData?: Lead | null;
}

export const LeadFormModal = ({ isOpen, onClose, users, subcontractors, initialData }: LeadFormModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl w-full max-w-2xl">
                <div className="p-4 md:p-6 border-b dark:border-dark-border">
                     <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {initialData ? "Modifier le Prospect" : "Créer un nouveau Prospect"}
                     </h2>
                </div>
                <div className="p-4 md:p-6">
                    <LeadForm
                        initialData={initialData}
                        onFormSubmit={onClose}
                        users={users}
                        subcontractors={subcontractors}
                    />
                </div>
            </div>
        </div>
    );
};