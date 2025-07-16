// enarva-nextjs-app/app/administration/delivery-notes/components/DeliveryNoteList.tsx
"use client";

import type { DeliveryNote, Order, Client, CompanyInfo } from "@prisma/client";
import Link from "next/link";
import { generateDeliveryNotePDF } from "@/lib/pdfGenerator";
import { Download, Eye } from "lucide-react";

type FullDeliveryNote = DeliveryNote & {
  order: Order & {
    client: Client;
  };
};

export function DeliveryNoteList({ deliveryNotes, companyInfo }: { deliveryNotes: FullDeliveryNote[]; companyInfo: CompanyInfo }) {

  const handleDownload = (deliveryNote: FullDeliveryNote) => {
    generateDeliveryNotePDF(deliveryNote, companyInfo);
  };

  const formatDate = (date: Date) => new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="border-b border-gray-200 dark:border-dark-border">
          <tr>
            <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">BL N°</th>
            <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Client</th>
            <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Commande N°</th>
            <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Date de Livraison</th>
            <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
          {deliveryNotes.map((dn) => (
            <tr key={dn.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
              <td className="p-4 text-sm font-semibold text-gray-800 dark:text-dark-text">{dn.deliveryNoteNumber}</td>
              <td className="p-4 text-sm text-gray-600 dark:text-dark-subtle">{dn.order.client.name}</td>
              <td className="p-4 text-sm text-gray-600 dark:text-dark-subtle">{dn.order.orderNumber}</td>
              <td className="p-4 text-sm text-gray-600 dark:text-dark-subtle">{formatDate(dn.date)}</td>
              <td className="p-4">
                 <div className="flex items-center justify-center gap-2">
                  <Link href={`/administration/delivery-notes/${dn.id}`} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-dark-subtle dark:hover:bg-gray-700 inline-block">
                    <Eye size={16} />
                  </Link>
                  <button onClick={() => handleDownload(dn)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-dark-subtle dark:hover:bg-gray-700 inline-block">
                    <Download size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {deliveryNotes.length === 0 && (
          <p className="py-8 text-center text-gray-500 dark:text-dark-subtle">Aucun bon de livraison trouvé.</p>
      )}
    </div>
  );
}