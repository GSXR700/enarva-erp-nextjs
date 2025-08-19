// app/administration/components/dashboard/QuickActions.tsx
"use client";

import Link from "next/link";
import { Plus, FileText, Users, Package, Receipt } from "lucide-react";

export function QuickActions() {
  const actions = [
    { icon: <FileText size={18} />, label: "Nouveau Devis", href: "/administration/quotes/new", color: "blue" },
    { icon: <Users size={18} />, label: "Nouveau Client", href: "/administration/clients/new", color: "green" },
    { icon: <Package size={18} />, label: "Nouvelle Mission", href: "/administration/missions/new", color: "purple" },
    { icon: <Receipt size={18} />, label: "Nouvelle Dépense", href: "/administration/expenses/new", color: "orange" },
  ];

  return (
    <div className="bg-white dark:bg-dark-container p-4 rounded-2xl shadow-md">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Actions Rapides</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {actions.map((action, index) => (
          <Link
            key={index}
            href={action.href}
            className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border-2 border-dashed transition-all hover:scale-105 hover:shadow-lg
              ${action.color === 'blue' ? 'border-blue-300 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20' : ''}
              ${action.color === 'green' ? 'border-green-300 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20' : ''}
              ${action.color === 'purple' ? 'border-purple-300 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20' : ''}
              ${action.color === 'orange' ? 'border-orange-300 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20' : ''}
              dark:border-dark-border`}
          >
            <div className={`mb-2 p-2 rounded-lg
              ${action.color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' : ''}
              ${action.color === 'green' ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400' : ''}
              ${action.color === 'purple' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400' : ''}
              ${action.color === 'orange' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400' : ''}`}
            >
              {action.icon}
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}