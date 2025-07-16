// enarva-nextjs-dashboard-app/app/administration/payroll/[employeeId]/components/PaymentFormModal.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { recordPayment } from "../../actions";
import { Loader2 } from "lucide-react";

interface PaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
}

export function PaymentFormModal({ isOpen, onClose, employeeId }: PaymentFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
      formRef.current?.reset();
    }
  }, [isOpen]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const result = await recordPayment(formData);

    if (result.success) {
      alert(result.message);
      onClose();
    } else {
      alert(result.error);
    }
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="w-full max-w-lg m-4 bg-white rounded-lg shadow-xl dark:bg-dark-container">
        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="flex items-center justify-between p-4 border-b dark:border-dark-border">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-dark-text">
              Enregistrer un Paiement
            </h3>
            <button type="button" onClick={onClose} className="text-3xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">&times;</button>
          </div>

          <div className="p-6 space-y-4">
            <input type="hidden" name="employeeId" value={employeeId} />
            
            <div>
              {/* CORRECTION : Ajout de dark:text-dark-subtle */}
              <label htmlFor="amount" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Montant (MAD)</label>
              {/* CORRECTION : Ajout des classes dark pour les champs de formulaire */}
              <input id="amount" name="amount" type="number" step="0.01" placeholder="Ex: 100.00" className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border dark:text-dark-text" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Date du paiement</label>
                <input id="date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border dark:text-dark-text" required />
              </div>
              <div>
                <label htmlFor="type" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Type</label>
                <select id="type" name="type" className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border dark:text-dark-text">
                  <option value="Avance">Avance</option>
                  <option value="Paie">Paie</option>
                  <option value="Remboursement">Remboursement</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Notes (Optionnel)</label>
              <textarea id="notes" name="notes" rows={2} placeholder="Description du paiement..." className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border dark:text-dark-text"></textarea>
            </div>
          </div>

          <div className="flex justify-end p-4 bg-gray-50 rounded-b-lg dark:bg-dark-surface">
            {/* CORRECTION : Ajout des classes dark pour le bouton Annuler */}
            <button type="button" onClick={onClose} className="px-4 py-2 font-bold text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
              Annuler
            </button>
            {/* CORRECTION : Ajout des classes dark pour le bouton principal */}
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 ml-2 font-bold text-white bg-primary rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center">
              {isSubmitting && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}