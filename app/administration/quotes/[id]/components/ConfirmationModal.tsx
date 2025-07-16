"use client";

import { useTransition } from "react";
import { createOrderFromQuote } from "../actions";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteId: string;
}

export function ConfirmationModal({ isOpen, onClose, quoteId }: ConfirmationModalProps) {
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;
  
  const handleSubmit = (formData: FormData) => {
      startTransition(async () => {
          const result = await createOrderFromQuote(formData);
          if (result?.error) {
              alert(result.error);
          } else {
              onClose();
          }
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl dark:bg-dark-container">
        <form action={handleSubmit}>
          <input type="hidden" name="quoteId" value={quoteId} />
          <h3 className="text-lg font-bold text-gray-800 dark:text-dark-text">Confirmer la Commande</h3>
          <p className="mt-1 mb-4 text-sm text-gray-500 dark:text-dark-subtle">
            Veuillez saisir les informations du bon de commande du client.
          </p>
          <div className="space-y-4">
            <div>
              <label htmlFor="refCommande" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">
                N° du Bon de Commande
              </label>
              <input
                type="text"
                id="refCommande"
                name="refCommande"
                className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border"
                required
              />
            </div>
            <div>
              <label htmlFor="orderedBy" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">
                Commandé par
              </label>
              <input
                type="text"
                id="orderedBy"
                name="orderedBy"
                placeholder="Ex: Mme Hayat NOURANI"
                className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 font-bold text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
              Annuler
            </button>
            <button type="submit" disabled={isPending} className="px-4 py-2 font-bold text-white bg-primary rounded-lg hover:opacity-90 disabled:opacity-50">
              {isPending ? "Génération..." : "Confirmer et Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}