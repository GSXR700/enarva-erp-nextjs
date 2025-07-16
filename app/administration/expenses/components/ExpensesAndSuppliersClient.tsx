// enarva-nextjs-dashboard-app/app/administration/expenses/components/ExpensesAndSuppliersClient.tsx
"use client";

import { useState } from "react";
import type { Supplier, Expense } from "@prisma/client";
import { SupplierList } from "../../suppliers/components/SupplierList";
import { ExpenseList } from "./ExpenseList";

type ExpenseWithSupplier = Expense & { supplier: Supplier | null };

interface Props {
  suppliers: Supplier[];
  expenses: ExpenseWithSupplier[];
}

export function ExpensesAndSuppliersClient({ suppliers, expenses }: Props) {
  const [activeTab, setActiveTab] = useState('expenses');

  const tabs = [
    { id: 'expenses', label: 'Dépenses' },
    { id: 'suppliers', label: 'Fournisseurs' },
  ];

  return (
    <div className="bg-white dark:bg-dark-container rounded-lg shadow-md">
      <div className="border-b border-gray-200 dark:border-dark-border">
        <nav className="-mb-px flex space-x-6 px-6" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-primary text-primary dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-dark-subtle dark:hover:text-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'expenses' && <ExpenseList expenses={expenses} suppliers={suppliers} />}
        {activeTab === 'suppliers' && <SupplierList suppliers={suppliers} />}
      </div>
    </div>
  );
}