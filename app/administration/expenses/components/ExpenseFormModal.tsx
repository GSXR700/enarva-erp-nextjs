// enarva-nextjs-dashboard-app/app/administration/expenses/components/ExpenseFormModal.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { saveExpense } from "../actions";
import { Loader2, UploadCloud } from "lucide-react";
import type { Expense, Supplier } from "@prisma/client";
import { useEdgeStore } from "@/lib/edgestore";

export function ExpenseFormModal({ isOpen, onClose, expense, suppliers }: { isOpen: boolean; onClose: () => void; expense: Expense | null; suppliers: Supplier[]}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File>();
  const [progress, setProgress] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const { edgestore } = useEdgeStore();

  useEffect(() => {
    if (!isOpen) {
      formRef.current?.reset();
      setFile(undefined);
      setProgress(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) { document.addEventListener("mousedown", handleClickOutside); }
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, [isOpen, onClose]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);

    if (file) {
        const res = await edgestore.publicFiles.upload({
            file,
            onProgressChange: (progress) => setProgress(progress),
        });
        formData.set("receiptUrl", res.url);
    } else if (expense?.receiptUrl) {
      formData.set("receiptUrl", expense.receiptUrl);
    }

    const result = await saveExpense(formData);
    if (result.success) {
      onClose();
    } else {
      alert(result.error);
    }
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div ref={modalRef} className="w-full max-w-2xl m-4 bg-white rounded-lg shadow-xl dark:bg-dark-container">
        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="flex items-center justify-between p-4 border-b dark:border-dark-border">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-dark-text">{expense ? "Modifier la Dépense" : "Nouvelle Dépense"}</h3>
            <button type="button" onClick={onClose} className="text-3xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">&times;</button>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <input type="hidden" name="id" defaultValue={expense?.id || ""} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="amount" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Montant (MAD)</label>
                <input id="amount" name="amount" type="number" step="0.01" defaultValue={expense?.amount || ''} placeholder="150.00" className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border dark:text-dark-text" required />
              </div>
              <div>
                <label htmlFor="date" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Date</label>
                <input id="date" name="date" type="date" defaultValue={expense ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border dark:text-dark-text" required />
              </div>
            </div>

            <div>
              <label htmlFor="category" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Catégorie</label>
              <input id="category" name="category" defaultValue={expense?.category || ''} placeholder="Ex: Transport, Achat Matériel..." className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border dark:text-dark-text" required />
            </div>

            <div>
              <label htmlFor="description" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Description</label>
              <textarea id="description" name="description" rows={2} defaultValue={expense?.description || ''} placeholder="Détails de la dépense..." className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border dark:text-dark-text" required></textarea>
            </div>

            <div>
              <label htmlFor="supplierId" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Fournisseur (Optionnel)</label>
              <select id="supplierId" name="supplierId" defaultValue={expense?.supplierId || ""} className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border dark:text-dark-text">
                <option value="">Aucun</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-subtle mb-1">Justificatif</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md dark:border-dark-border">
                    <div className="space-y-1 text-center">
                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400"/>
                        <div className="flex text-sm text-gray-600 dark:text-dark-subtle">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-blue-700 dark:bg-dark-container">
                                <span>Téléchargez un fichier</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => setFile(e.target.files?.[0])} />
                            </label>
                            <p className="pl-1">ou glissez-déposez</p>
                        </div>
                        <p className="text-xs text-gray-500">{file ? file.name : (expense?.receiptUrl ? "Un fichier existe déjà. Remplacer ?" : "PNG, JPG, PDF jusqu'à 5MB")}</p>
                    </div>
                </div>
            </div>
            {progress > 0 && <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-dark-surface"><div className="bg-primary h-2.5 rounded-full" style={{width: `${progress}%`}}></div></div>}
          </div>

          <div className="flex justify-end p-4 bg-gray-50 rounded-b-lg dark:bg-dark-surface">
            <button type="button" onClick={onClose} className="px-4 py-2 font-bold text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Annuler</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 ml-2 font-bold text-white bg-primary rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center">
              {isSubmitting && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
              {expense ? "Mettre à jour" : "Créer la Dépense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}