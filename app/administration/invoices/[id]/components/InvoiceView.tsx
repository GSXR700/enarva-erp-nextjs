// enarva-nextjs-dashboard-app/app/administration/invoices/[id]/components/InvoiceView.tsx
"use client";

import type { Invoice, Client, Order, CompanyInfo, Quote } from "@prisma/client";
import { useTransition } from "react";
import { updateInvoiceStatus } from "../actions";
import { generateInvoicePDF } from "@/lib/pdfGenerator";
import { Download, CheckCircle } from "lucide-react";

type FullInvoice = Invoice & { 
  client: Client; 
  order: Order & { 
    quote: Quote | null 
  }; 
};

// CORRECTION : On utilise le même type "intelligent"
type AnyItem = {
  designation: string;
  quantity?: string;
  unitPrice?: string;
  total?: number;
  qte?: number;
  pu_ht?: number;
  total_ht?: number;
};

export function InvoiceView({ invoice, companyInfo }: { invoice: FullInvoice; companyInfo: CompanyInfo }) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (status: "PAID" | "SENT") => {
    startTransition(() => {
      updateInvoiceStatus(invoice.id, status);
    });
  };

  const handleDownload = () => {
    generateInvoicePDF(invoice, companyInfo);
  };

  const formatDate = (date: Date) => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(date));
  const formatCurrency = (amount: number | null | undefined) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount || 0);
  
  const items = invoice.items as AnyItem[];
  // Using order's items property directly since quote details are part of the items
  const orderItems = invoice.items;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">Facture {invoice.invoiceNumber}</h1>
          <p className="text-gray-500 dark:text-dark-subtle mt-1">Commande N°: {invoice.order.orderNumber}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleDownload} className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-dark-container dark:text-dark-subtle dark:border-dark-border dark:hover:bg-dark-surface"><Download className="mr-2 h-4 w-4"/>Télécharger</button>
          {invoice.status !== 'PAID' && (
            <button onClick={() => handleStatusChange('PAID')} disabled={isPending} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"><CheckCircle className="mr-2 h-4 w-4"/>{isPending ? "..." : "Payée"}</button>
          )}
        </div>
      </div>

      <div className="p-8 bg-white rounded-lg shadow-md dark:bg-dark-container">
        <div className="grid grid-cols-2 gap-8 pb-8 border-b border-gray-200 dark:border-dark-border">
            <div><h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">De:</h3><p className="mt-2 text-gray-600 dark:text-dark-subtle">{companyInfo.companyName}</p><p className="text-gray-600 dark:text-dark-subtle">{companyInfo.address}</p></div>
            <div className="text-right"><h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">Pour:</h3><p className="mt-2 font-medium text-gray-700 dark:text-dark-text">{invoice.client.nom}</p><p className="text-gray-600 dark:text-dark-subtle">{invoice.client.adresse}</p></div>
        </div>

        {invoice.order.quote?.object && (
            <div className="mt-8 pb-8 border-b border-gray-200 dark:border-dark-border">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">Objet:</h3>
                <p className="mt-1 text-gray-600 dark:text-dark-subtle">{invoice.order.quote.object}</p>
            </div>
        )}

        <div className="mt-8">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-200 dark:border-dark-border">
                        <th className="p-2 text-left text-sm font-medium text-gray-500 dark:text-dark-subtle">Désignation</th>
                        <th className="p-2 text-center text-sm font-medium text-gray-500 dark:text-dark-subtle">Qté</th>
                        <th className="p-2 text-right text-sm font-medium text-gray-500 dark:text-dark-subtle">P.U.</th>
                        <th className="p-2 text-right text-sm font-medium text-gray-500 dark:text-dark-subtle">Total HT</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                    {items.map((item, index) => (
                        <tr key={index}>
                            <td className="p-2 text-gray-800 dark:text-dark-text">{item.designation}</td>
                            <td className="p-2 text-center text-gray-600 dark:text-dark-subtle">{item.quantity ?? item.qte}</td>
                            <td className="p-2 text-right text-gray-600 dark:text-dark-subtle">{item.unitPrice ?? formatCurrency(item.pu_ht)}</td>
                            <td className="p-2 text-right font-medium text-gray-800 dark:text-dark-text">{formatCurrency(item.total ?? item.total_ht)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        
        <div className="flex justify-end mt-8">
            <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between text-gray-600 dark:text-dark-subtle"><span>Total HT</span><span>{formatCurrency(invoice.totalHT)}</span></div>
                <div className="flex justify-between text-gray-600 dark:text-dark-subtle"><span>TVA (20%)</span><span>{formatCurrency(invoice.tva)}</span></div>
                <div className="pt-2 mt-2 border-t border-gray-200 dark:border-dark-border flex justify-between font-bold text-lg text-gray-800 dark:text-dark-text"><span>Total TTC</span><span>{formatCurrency(invoice.totalTTC)}</span></div>
            </div>
        </div>
      </div>
    </div>
  );
}