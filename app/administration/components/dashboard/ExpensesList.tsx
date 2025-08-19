// app/administration/components/dashboard/ExpensesList.tsx
import Link from "next/link";
import { ArrowRight, Receipt } from "lucide-react";

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: Date;
  status: string;
  category?: { name: string } | null;
  supplier?: { name: string | null } | null;
}

interface ExpensesListProps {
  expenses: Expense[];
  viewAllLink: string;
}

export function ExpensesList({ expenses, viewAllLink }: ExpensesListProps) {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount);

  const getStatusBadge = (status: string) => {
    const base = "px-2 py-0.5 text-xs font-medium rounded-full";
    switch (status) {
      case 'APPROVED': 
        return <span className={`${base} bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300`}>Approuvée</span>;
      case 'PENDING': 
        return <span className={`${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300`}>En attente</span>;
      case 'REJECTED': 
        return <span className={`${base} bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300`}>Rejetée</span>;
      default: 
        return <span className={`${base} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`}>{status}</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-dark-container p-4 sm:p-6 rounded-2xl shadow-md h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Receipt className="text-purple-600 dark:text-purple-400" size={20} />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Dépenses Récentes</h3>
        </div>
        <Link href={viewAllLink} className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
          Voir tout <ArrowRight size={14} />
        </Link>
      </div>
      <div className="flex-grow overflow-y-auto">
        {expenses.length > 0 ? (
          <ul className="divide-y divide-gray-100 dark:divide-dark-border">
            {expenses.map(expense => (
              <li key={expense.id} className="py-3">
                <Link href={`${viewAllLink}/${expense.id}`} className="flex justify-between items-start group hover:bg-gray-50 dark:hover:bg-dark-surface rounded-lg p-2 -m-2 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-dark-text group-hover:text-primary transition-colors truncate">
                      {expense.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-500 dark:text-dark-subtle">
                        {expense.supplier?.name || expense.category?.name || 'Non catégorisé'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end ml-4">
                    <p className="font-semibold text-gray-800 dark:text-dark-text whitespace-nowrap">
                      {formatCurrency(expense.amount)}
                    </p>
                    <div className="mt-1">{getStatusBadge(expense.status)}</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-sm text-gray-400 dark:text-dark-subtle py-8">
            <Receipt className="mb-2" size={32} />
            <p>Aucune dépense récente</p>
          </div>
        )}
      </div>
    </div>
  );
}