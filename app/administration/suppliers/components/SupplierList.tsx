// enarva-nextjs-dashboard-app/app/administration/suppliers/components/SupplierList.tsx
"use client";

import { useState } from "react";
import type { Supplier } from "@prisma/client";
import { SupplierFormModal } from "./SupplierFormModal";
import { PlusCircle, Edit, Trash2 } from "lucide-react";

export function SupplierList({ suppliers }: { suppliers: Supplier[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const handleOpenModal = (supplier: Supplier | null = null) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="p-4 border-b dark:border-dark-border flex justify-end">
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 text-sm font-medium text-white bg-primary px-4 py-2 rounded-lg hover:opacity-90">
            <PlusCircle size={18} />
            <span>Nouveau Fournisseur</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-200 dark:border-dark-border">
            <tr>
              <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Nom</th>
              <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Contact</th>
              <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Téléphone</th>
              <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Email</th>
              <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
            {suppliers.map((supplier) => (
              <tr key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                <td className="p-4 font-medium text-gray-800 dark:text-dark-text">{supplier.name}</td>
                <td className="p-4 text-sm text-gray-600 dark:text-dark-subtle">{supplier.contact || "-"}</td>
                <td className="p-4 text-sm text-gray-600 dark:text-dark-subtle">{supplier.phone || "-"}</td>
                <td className="p-4 text-sm text-gray-600 dark:text-dark-subtle">{supplier.email || "-"}</td>
                <td className="p-4 flex items-center gap-4">
                  <button onClick={() => handleOpenModal(supplier)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                    <Edit size={16}/>
                  </button>
                  {/* Le bouton de suppression sera ajouté ici */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {suppliers.length === 0 && <p className="p-4 text-center text-sm text-gray-400">Aucun fournisseur trouvé.</p>}
      </div>
      <SupplierFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        supplier={editingSupplier}
      />
    </>
  );
}