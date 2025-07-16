// enarva-nextjs-dashboard-app/app/administration/expenses/components/ExpenseList.tsx
"use client";

import { useState } from "react";
import type { Expense, Supplier } from "@prisma/client";
import { ExpenseFormModal } from "./ExpenseFormModal";
import { PlusCircle, Edit, Trash2, Download } from "lucide-react";

type ExpenseWithSupplier = Expense & { supplier: Supplier | null };

const formatCurrency = (amount: number) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount);
const formatDate = (date: Date) => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(date));

export function ExpenseList({ expenses, suppliers }: { expenses: ExpenseWithSupplier[]; suppliers: Supplier[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseWithSupplier | null>(null);

  const handleOpenModal = (expense: ExpenseWithSupplier | null = null) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 text-sm font-medium text-white bg-primary px-4 py-2 rounded-lg hover:opacity-90">
            <PlusCircle size={18} />
            <span>Nouvelle Dépense</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          {/* ... Thead ... */}
          <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                <td className="p-4 font-medium dark:text-dark-text">{formatDate(expense.date)}</td>
                <td className="p-4 text-sm dark:text-dark-subtle">{expense.category}</td>
                <td className="p-4 text-sm dark:text-dark-subtle">{expense.description}</td>
                <td className="p-4 text-sm dark:text-dark-subtle">{expense.supplier?.name || "-"}</td>
                <td className="p-4 font-semibold text-right dark:text-dark-text">{formatCurrency(expense.amount)}</td>
                <td className="p-4 flex items-center justify-end gap-2">
                    {expense.receiptUrl && (
                        <a href={expense.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary"><Download size={16}/></a>
                    )}
                    <button onClick={() => handleOpenModal(expense)} className="text-blue-600 hover:text-blue-800"><Edit size={16}/></button>
                    {/* Le bouton supprimer sera ajouté ici */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ExpenseFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} expense={editingExpense} suppliers={suppliers} />
    </>
  );
}