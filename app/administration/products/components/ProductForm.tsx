// app/administration/products/components/ProductForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { saveProduct } from "../actions";

interface ProductFormProps {
  product?: any; // Pour l'édition future
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await saveProduct(formData);
      
      if (result.success) {
        router.push('/administration/products');
        router.refresh();
      } else {
        setError(result.error || 'Une erreur est survenue');
      }

    } catch (error) {
      console.error('Erreur:', error);
      setError('Une erreur inattendue est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      {product && (
        <input type="hidden" name="id" value={product.id} />
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="designation" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
            Désignation du Produit *
          </label>
          <input
            type="text"
            id="designation"
            name="designation"
            required
            defaultValue={product?.designation || ''}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text"
            placeholder="Ex: Produit de nettoyage multi-surfaces"
          />
        </div>

        <div>
          <label htmlFor="pu_ht" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
            Prix Unitaire HT (MAD) *
          </label>
          <input
            type="number"
            id="pu_ht"
            name="pu_ht"
            step="0.01"
            min="0"
            required
            defaultValue={product?.pu_ht || ''}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text"
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-600 dark:text-dark-subtle hover:text-gray-800 dark:hover:text-dark-text transition"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {product ? 'Modifier' : 'Créer'} le Produit
        </button>
      </div>
    </form>
  );
}