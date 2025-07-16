"use client";

import { useState, useRef, useEffect } from "react";
import { recordPayAdvance } from "../../actions";
import { Loader2 } from "lucide-react";

interface PayAdvanceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
}

export function PayAdvanceFormModal({ isOpen, onClose, employeeId }: PayAdvanceFormModalProps) {
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
    const result = await recordPayAdvance(formData);

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
              Enregistrer une Avance
            </h3>
            <button type="button" onClick={onClose} className="text-3xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">&times;</button>
          </div>

          <div className="p-6 space-y-4">
            <input type="hidden" name="employeeId" value={employeeId} />
            <div>
              <label htmlFor="amount" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Montant de l'avance (MAD)</label>
              <input id="amount" name="amount" type="number" step="0.01" placeholder="Ex: 50.00" className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border dark:text-dark-text" required />
            </div>
            <div>
              <label htmlFor="reason" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Raison (Optionnel)</label>
              <textarea id="reason" name="reason" rows={2} placeholder="Ex: Avance pour transport" className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border dark:text-dark-text"></textarea>
            </div>
          </div>

          <div className="flex justify-end p-4 bg-gray-50 rounded-b-lg dark:bg-dark-surface">
            <button type="button" onClick={onClose} className="px-4 py-2 font-bold text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Annuler</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 ml-2 font-bold text-white bg-primary rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center">
              {isSubmitting && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
              Enregistrer l'Avance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}