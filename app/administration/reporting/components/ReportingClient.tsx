// app/administration/reporting/components/ReportingClient.tsx
"use client";

import { useState } from "react";
import type { Invoice, Client, CompanyInfo, Order, Quote, JuridicState, QuoteStatus } from "@prisma/client";
import { getFilteredInvoices } from "../actions";
import { generateInvoiceReportPDF } from "@/lib/pdfGenerator";
import { FileDown, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

type FullInvoice = Invoice & {
    client: Client;
    order: Order & {
        quote: Quote | null;
    };
};

const formatCurrency = (amount: number) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount);
const formatDate = (date: Date) => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(date));

export function ReportingClient({ initialInvoices, companyInfo }: { initialInvoices: FullInvoice[]; companyInfo: CompanyInfo }) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleFilter = async () => {
    try {
      setIsLoading(true);
      const result = await getFilteredInvoices(new Date(startDate), new Date(endDate));
      if (result.success) {
        setInvoices(result.data as FullInvoice[]);
      } else {
        toast.error(result.error || "Une erreur est survenue lors du filtrage");
      }
    } catch (error) {
      toast.error("Erreur lors de la récupération des données");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (invoices.length === 0) {
      toast.error("Aucune donnée à exporter", {
        description: "Veuillez d'abord sélectionner une période contenant des factures."
      });
      return;
    }

    try {
      setIsExporting(true);
      await generateInvoiceReportPDF(invoices, startDate, endDate, companyInfo);
      toast.success("Le rapport PDF a été généré avec succès");
    } catch (error) {
      toast.error("Erreur lors de la génération du PDF", {
        description: "Veuillez réessayer plus tard ou contacter le support."
      });
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    toast.info("Fonctionnalité à venir", {
      description: "L'export Excel sera disponible dans une prochaine mise à jour."
    });
  };

  const total = invoices.reduce((sum, inv) => sum + inv.totalTTC, 0);

  return (
    <div className="space-y-6">
      {/* Barre de filtrage et d'actions */}
      <div className="p-4 bg-white dark:bg-dark-container rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-subtle mb-1">Date de début</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border dark:text-dark-text" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-subtle mb-1">Date de fin</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border dark:text-dark-text" />
          </div>
          <button onClick={handleFilter} disabled={isLoading} className="h-10 px-4 bg-primary text-white font-semibold rounded-lg flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50">
            {isLoading ? <Loader2 className="animate-spin" /> : "Appliquer le filtre"}
          </button>
          <div className="flex gap-2 justify-end">
             <button
               onClick={handleExportPDF}
               disabled={isExporting}
               className="h-10 px-4 bg-red-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {isExporting ? <Loader2 className="animate-spin" size={16} /> : <FileDown size={16} />}
               PDF
             </button>
             <button
               onClick={handleExportExcel}
               className="h-10 px-4 bg-green-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-green-700"
             >
               <FileDown size={16} />
               Excel
             </button>
          </div>
        </div>
      </div>

      {/* Tableau des résultats */}
      <div className="bg-white dark:bg-dark-container rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-left">
            <thead className="border-b border-gray-200 dark:border-dark-border">
                <tr>
                    <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Facture N°</th>
                    <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Client</th>
                    <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Date</th>
                    <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle text-right">Total TTC</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                {invoices.map(invoice => (
                    <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                        <td className="p-4 font-medium text-gray-800 dark:text-dark-text">{invoice.invoiceNumber}</td>
                        <td className="p-4 text-gray-600 dark:text-dark-subtle">{invoice.client.nom}</td>
                        <td className="p-4 text-gray-600 dark:text-dark-subtle">{formatDate(invoice.date)}</td>
                        <td className="p-4 font-semibold text-right dark:text-dark-text">{formatCurrency(invoice.totalTTC)}</td>
                    </tr>
                ))}
            </tbody>
            <tfoot className="border-t-2 border-gray-300 dark:border-dark-border">
                <tr>
                    <td colSpan={3} className="p-4 text-right font-bold dark:text-white">Total</td>
                    <td className="p-4 text-right font-bold text-lg dark:text-white">{formatCurrency(total)}</td>
                </tr>
            </tfoot>
        </table>
        {invoices.length === 0 && <p className="p-8 text-center text-gray-500">Aucune facture trouvée pour cette période.</p>}
      </div>
    </div>
  );
}