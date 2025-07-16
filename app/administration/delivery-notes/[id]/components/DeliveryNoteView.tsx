// enarva-nextjs-dashboard-app/app/administration/delivery-notes/[id]/components/DeliveryNoteView.tsx
"use client";

import type { DeliveryNote, Order, Client, CompanyInfo } from "@prisma/client";
import { generateDeliveryNotePDF } from "@/lib/pdfGenerator";
import { Download } from "lucide-react";

interface DeliveryNoteItem {
    designation: string;
    qteCommandee: number | string;
    qteLivree: number | string;
    observations?: string;
}

type FullDeliveryNote = DeliveryNote & {
    order: Order & {
        client: Client;
        quote: {
            id: string;
            quoteNumber: string;
        } | null;
    };
    items: DeliveryNoteItem[];
};

export function DeliveryNoteView({ 
  deliveryNote, 
  companyInfo 
}: { 
  deliveryNote: Omit<FullDeliveryNote, 'items'> & { items: any }; 
  companyInfo: CompanyInfo 
}) {
  const items = (deliveryNote.items as DeliveryNoteItem[]) || [];

  const handleDownload = () => {
    generateDeliveryNotePDF(deliveryNote as FullDeliveryNote, companyInfo);
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('fr-FR', { 
      dateStyle: 'long',
      timeZone: 'Europe/Paris'
    }).format(typeof date === 'string' ? new Date(date) : date);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">Bon de Livraison {deliveryNote.deliveryNoteNumber}</h1>
          <p className="text-gray-500 dark:text-dark-subtle mt-1">
            Commande N°: {deliveryNote.order.orderNumber}
            {deliveryNote.order.quote && (
              <span className="ml-2">
                (Devis N°: {deliveryNote.order.quote.quoteNumber})
              </span>
            )}
          </p>
          <p className="text-gray-500 dark:text-dark-subtle mt-1">
            Date: {formatDate(deliveryNote.date)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleDownload} 
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-dark-container dark:text-dark-subtle dark:border-dark-border dark:hover:bg-dark-surface"
          >
            <Download className="mr-2 h-4 w-4"/>Télécharger en PDF
          </button>
        </div>
      </div>

      <div className="p-8 bg-white rounded-lg shadow-md dark:bg-dark-container">
        <div className="pb-8 border-b border-gray-200 dark:border-dark-border">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">Livré à:</h3>
            <p className="mt-2 font-medium text-gray-700 dark:text-dark-text">{deliveryNote.order.client.nom}</p>
            <p className="text-gray-600 dark:text-dark-subtle">{deliveryNote.order.client.adresse}</p>
        </div>
        <div className="mt-8">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-200 dark:border-dark-border">
                        <th className="p-2 text-left text-sm font-medium text-gray-500 dark:text-dark-subtle">Désignation</th>
                        <th className="p-2 text-center text-sm font-medium text-gray-500 dark:text-dark-subtle">Qté Commandée</th>
                        <th className="p-2 text-center text-sm font-medium text-gray-500 dark:text-dark-subtle">Qté Livrée</th>
                        <th className="p-2 text-center text-sm font-medium text-gray-500 dark:text-dark-subtle">Observations</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                    {items.map((item: DeliveryNoteItem, index: number) => (
                        <tr key={`${index}-${item.designation}`}>
                            <td className="p-2 text-gray-800 dark:text-dark-text">{item.designation}</td>
                            <td className="p-2 text-center text-gray-600 dark:text-dark-subtle">{item.qteCommandee}</td>
                            <td className="p-2 text-center text-gray-600 dark:text-dark-subtle">{item.qteLivree}</td>
                            <td className="p-2 text-center text-gray-600 dark:text-dark-subtle">{item.observations || '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}