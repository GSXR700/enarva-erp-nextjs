// enarva-nextjs-dashboard-app/app/administration/settings/components/PayRateManagement.tsx
"use client";

import { useState } from "react";
import type { PayRate } from "@prisma/client";
import { deletePayRate } from "../actions";
import { PayRateFormModal } from "./PayRateFormModal";
import { PlusCircle, Edit, Trash2 } from "lucide-react";

const formatCurrency = (amount: number) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount || 0);

export function PayRateManagement({ payRates }: { payRates: PayRate[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayRate, setEditingPayRate] = useState<PayRate | null>(null);

  const handleOpenModal = (payRate: PayRate | null = null) => {
    setEditingPayRate(payRate);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce tarif ?")) {
      const result = await deletePayRate(id);
      if (result.error) {
        alert(result.error);
      }
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-dark-container rounded-lg shadow-md">
        <div className="p-4 border-b dark:border-dark-border flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg dark:text-dark-text">Grilles Tarifaires</h3>
            <p className="text-sm text-gray-500 dark:text-dark-subtle">Définissez les tarifs de base pour vos employés.</p>
          </div>
          <button onClick={() => handleOpenModal()} className="flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80">
            <PlusCircle size={18} />
            <span>Nouveau Tarif</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-gray-200 dark:border-dark-border">
              <tr>
                <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Nom du Tarif</th>
                <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Type</th>
                <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Montant</th>
                <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
              {payRates.map((rate) => (
                <tr key={rate.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                  <td className="p-4 font-medium text-gray-800 dark:text-dark-text">{rate.name}</td>
                  <td className="p-4 text-sm text-gray-600 dark:text-dark-subtle">{rate.type}</td>
                  <td className="p-4 text-sm text-gray-600 dark:text-dark-subtle">{formatCurrency(rate.amount)}</td>
                  <td className="p-4 flex items-center gap-4">
                    <button onClick={() => handleOpenModal(rate)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                      <Edit size={16}/>
                    </button>
                    <button onClick={() => handleDelete(rate.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                      <Trash2 size={16}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
           {payRates.length === 0 && <p className="p-4 text-center text-sm text-gray-400">Aucun tarif défini.</p>}
        </div>
      </div>
      <PayRateFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        payRate={editingPayRate}
      />
    </>
  );
}