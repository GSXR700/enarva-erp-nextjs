// enarva-nextjs-dashboard-app/app/administration/expenses/components/SupplierFormModal.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import type { Supplier } from "@prisma/client";
import { saveSupplier } from "../actions";
import { Loader2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
}

export function SupplierFormModal({ isOpen, onClose, supplier }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      formRef.current?.reset();
    }
  }, [isOpen]);

  // CORRECTION : Ajout de la logique pour fermer au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const result = await saveSupplier(formData);
    if (result.success) {
      onClose();
    } else {
      alert(result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div ref={modalRef} className="w-full max-w-2xl m-4 bg-white rounded-lg shadow-xl dark:bg-dark-container">
        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="flex items-center justify-between p-4 border-b dark:border-dark-border">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-dark-text">
              {supplier ? "Modifier le Fournisseur" : "Nouveau Fournisseur"}
            </h3>
            <button type="button" onClick={onClose} className="text-3xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">&times;</button>
          </div>
          <div className="p-6 space-y-4">
            <input type="hidden" name="id" defaultValue={supplier?.id || ""} />
            <div>
              <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Nom du Fournisseur</label>
              <input id="name" name="name" defaultValue={supplier?.name || ""} className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border dark:text-dark-text" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Nom du Contact</label>
                <input id="contact" name="contact" defaultValue={supplier?.contact || ""} className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border dark:text-dark-text" />
              </div>
              <div>
                <label htmlFor="phone" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Téléphone</label>
                <input id="phone" name="phone" defaultValue={supplier?.phone || ""} className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border dark:text-dark-text" />
              </div>
            </div>
            <div>
                <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Email</label>
                <input id="email" name="email" type="email" defaultValue={supplier?.email || ""} className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border dark:text-dark-text" />
            </div>
            <div>
              <label htmlFor="address" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Adresse</label>
              <textarea id="address" name="address" rows={2} defaultValue={supplier?.address || ""} className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border dark:text-dark-text"></textarea>
            </div>
          </div>
          <div className="flex justify-end p-4 bg-gray-50 rounded-b-lg dark:bg-dark-surface">
            <button type="button" onClick={onClose} className="px-4 py-2 font-bold text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Annuler</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 ml-2 font-bold text-white bg-primary rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center">
              {isSubmitting && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
              {supplier ? "Mettre à jour" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}