// enarva-nextjs-app/app/administration/products/components/ProductList.tsx
"use client";

import { useState, useEffect } from "react";
import type { Product } from "@prisma/client";
import { ProductFormModal } from "./ProductFormModal";
import { DeleteProductButton } from "./DeleteProductButton";
import { Edit } from "lucide-react";

export function ProductList({ products }: { products: Product[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };
  
  // Exposition de la fonction d'ouverture de la modale au niveau global
  // pour que le bouton "Nouveau Produit" (qui est un Server Component) puisse y accéder.
  useEffect(() => {
    (window as any).openProductModal = (product: Product | null = null) => {
      setEditingProduct(product);
      setIsModalOpen(true);
    };
    // Nettoyage au démontage du composant
    return () => {
      delete (window as any).openProductModal;
    };
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount || 0);
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-200 dark:border-dark-border">
            <tr>
              <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle w-3/5">Désignation</th>
              <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle w-1/5">Prix Unitaire (HT)</th>
              <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle w-1/5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                <td className="p-4 text-sm text-gray-800 dark:text-dark-text">{product.designation}</td>
                <td className="p-4 text-sm text-gray-600 dark:text-dark-subtle">{formatCurrency(product.pu_ht)}</td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-4">
                    <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                      <Edit size={16} />
                    </button>
                    <DeleteProductButton productId={product.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {products.length === 0 && (
          <p className="py-8 text-center text-gray-500 dark:text-dark-subtle">Aucun produit trouvé.</p>
      )}

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingProduct}
      />
    </>
  );
}