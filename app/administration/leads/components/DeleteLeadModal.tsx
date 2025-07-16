// app/administration/leads/components/modals/DeleteLeadModal.tsx
"use client";

import { useModal } from "@/hooks/use-modal-store";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const DeleteLeadModal = () => {
    const { isOpen, onClose, type, data } = useModal();
    const router = useRouter();
    const { lead } = data;

    const isModalOpen = isOpen && type === "deleteLead";

    const [isLoading, setIsLoading] = useState(false);

    const onConfirm = async () => {
        if (!lead) return;

        setIsLoading(true);
        try {
            await fetch(`/api/leads/${lead.id}`, {
                method: 'DELETE',
            });

            alert("Prospect supprimé avec succès.");
            router.refresh();
            onClose();
        } catch (error) {
            console.error("Erreur lors de la suppression du prospect:", error);
            alert("Une erreur s'est produite.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isModalOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 md:p-6 border-b dark:border-dark-border">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Confirmer la Suppression</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl">&times;</button>
                </div>
                <div className="p-4 md:p-6">
                    <p className="text-sm text-center text-gray-600 dark:text-dark-subtle">
                        Êtes-vous sûr de vouloir supprimer le prospect <span className="font-bold">{lead?.nom}</span> ?<br/>
                        Cette action est irréversible.
                    </p>
                    <div className="flex justify-end items-center pt-6 space-x-3">
                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={onClose}
                            className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-dark-border dark:hover:bg-gray-700 disabled:opacity-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={onConfirm}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 h-10 py-2 px-4 disabled:opacity-50"
                        >
                            {isLoading ? "Suppression..." : "Confirmer"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}