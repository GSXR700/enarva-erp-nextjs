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
              {/* CORRECTION: client.name → client.nom selon le schéma Prisma */}
              <td className="p-4 text-sm text-gray-600 dark:text-dark-subtle">{dn.order.client.nom}</td>
              <td className="p-4 text-sm text-gray-600 dark:text-dark-subtle">{dn.order.orderNumber}</td>
              <td className="p-4 text-sm text-gray-600 dark:text-dark-subtle">{formatDate(dn.date)}</td>
              <td className="p-4">
                <div className="flex justify-center gap-2">
                  <Link 
                    href={`/administration/delivery-notes/${dn.id}`}
                    className="inline-flex items-center justify-center p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <button 
                    onClick={() => handleDownload(dn)}
                    className="inline-flex items-center justify-center p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}