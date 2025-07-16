// enarva-nextjs-app/app/administration/invoices/components/InvoiceList.tsx

"use client";

import type { Invoice, Client } from "@prisma/client";
import Link from "next/link";
import { Eye } from "lucide-react";

// Le type Client dans l'Invoice a maintenant un champ `nom`
type InvoiceWithClient = Invoice & {
  client: {
    nom: string | null;
  } | null;
};

export function InvoiceList({ invoices }: { invoices: InvoiceWithClient[] }) {
  
  const formatDate = (date: Date) => new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date));
  const formatCurrency = (amount: number) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount || 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT': return <span className="px-2.5 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full dark:bg-yellow-900 dark:text-yellow-300">Brouillon</span>;
      case 'SENT': return <span className="px-2.5 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">Envoyée</span>;
      case 'PAID': return <span className="px-2.5 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-300">Payée</span>;
      case 'LATE': return <span className="px-2.5 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full dark:bg-red-900 dark:text-red-300">En retard</span>;
      case 'CANCELLED': return <span className="px-2.5 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-300">Annulée</span>;
      default: return <span className="px-2.5 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-300">{status}</span>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="border-b border-gray-200 dark:border-dark-border">
          <tr>
            <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Numéro</th>
            <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Client</th>
            <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Date</th>
            <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Total TTC</th>
            <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Statut</th>
            <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
              <td className="p-4 text-sm font-semibold text-gray-800 dark:text-dark-text">{invoice.invoiceNumber}</td>
              <td className="p-4 text-sm text-gray-600 dark:text-dark-subtle">
                {/* CORRECTION : On utilise `invoice.client.nom` */}
                {invoice.client ? invoice.client.nom : <span className="text-red-500">Client non trouvé</span>}
              </td>
              <td className="p-4 text-sm text-gray-600 dark:text-dark-subtle">{formatDate(invoice.date)}</td>
              <td className="p-4 text-sm font-medium text-gray-800 dark:text-dark-text">{formatCurrency(invoice.totalTTC)}</td>
              <td className="p-4">{getStatusBadge(invoice.status)}</td>
              <td className="p-4">
                <div className="flex items-center justify-center gap-2">
                  <Link href={`/administration/invoices/${invoice.id}`} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-dark-subtle dark:hover:bg-gray-700">
                    <Eye size={16} />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {invoices.length === 0 && (
          <p className="py-8 text-center text-gray-500 dark:text-dark-subtle">Aucune facture trouvée.</p>
      )}
    </div>
  );
}