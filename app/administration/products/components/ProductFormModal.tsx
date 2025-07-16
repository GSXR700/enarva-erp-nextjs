// app/administration/products/components/ProductFormModal.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@prisma/client";
import { saveProduct } from "../actions";

export function ProductFormModal({
  isOpen,
  onClose,
  product,
}: {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      formRef.current?.reset();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const result = await saveProduct(formData);
    if (result.success) {
      onClose();
    } else {
      alert(result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg m-4 bg-white rounded-lg shadow-xl dark:bg-dark-container">
        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-dark-text">
              {product ? "Modifier le produit" : "Ajouter un produit"}
            </h3>
            <button type="button" onClick={onClose} className="text-3xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">&times;</button>
          </div>
          <div className="p-6 space-y-4">
            <input type="hidden" name="id" defaultValue={product?.id || ""} />
            <div>
                <label htmlFor="designation" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Désignation</label>
                <input id="designation" name="designation" defaultValue={product?.designation || ""} placeholder="Nom du produit ou service" className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border dark:text-dark-text" required />
            </div>
            <div>
                <label htmlFor="pu_ht" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Prix Unitaire (HT)</label>
                <input id="pu_ht" name="pu_ht" type="number" step="0.01" defaultValue={product?.pu_ht || ""} placeholder="0.00" className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border dark:text-dark-text" required />
            </div>
          </div>
          <div className="flex justify-end p-4 bg-gray-50 rounded-b-lg dark:bg-dark-surface">
            <button type="button" onClick={onClose} className="px-4 py-2 font-bold text-gray-800 bg-gray-200 rounded hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
              Annuler
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 ml-2 font-bold text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50">
              {isSubmitting ? "Sauvegarde..." : "Sauvegarder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}