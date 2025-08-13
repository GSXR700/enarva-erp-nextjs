"use client";

import { useState, useRef, useEffect } from "react";
import type { Subcontractor } from "@prisma/client";
import { assignSubcontractor } from "../../actions";
import { Loader2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  missionId: string;
  subcontractors: Subcontractor[];
}

export function SubcontractorAssignmentModal({ isOpen, onClose, missionId, subcontractors }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isOpen) { formRef.current?.reset(); }
  }, [isOpen]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    await assignSubcontractor(formData);
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="w-full max-w-lg m-4 bg-white rounded-lg shadow-xl dark:bg-dark-container">
        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="p-4 border-b border-gray-200 dark:border-dark-border">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-dark-text">Assigner un Sous-traitant</h3>
          </div>
          <div className="p-6 space-y-4">
            <input type="hidden" name="missionId" value={missionId} />
            <div>
              <label htmlFor="subcontractorId" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Partenaire</label>
              <select id="subcontractorId" name="subcontractorId" className="w-full p-2 border border-gray-300 rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border dark:text-dark-text" required>
                <option value="">-- Sélectionner un partenaire --</option>
                {subcontractors.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name} ({sub.serviceType})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end p-4 bg-gray-50 rounded-b-lg dark:bg-dark-surface">
            <button type="button" onClick={onClose} className="px-4 py-2 font-bold text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Annuler</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 ml-2 font-bold text-white bg-primary rounded-lg disabled:opacity-50 flex items-center">
              {isSubmitting && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
              Assigner
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}