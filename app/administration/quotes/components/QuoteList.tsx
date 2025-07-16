// enarva-nextjs-app/app/administration/quotes/components/QuoteList.tsx
"use client";

import { useState } from "react";
// Le type Client a maintenant un champ `nom` et non `name`
import type { Quote, Client, CompanyInfo, Prestation } from "@prisma/client";
import Link from "next/link";
import { DeleteQuoteButton } from "./DeleteQuoteButton";
import { generateQuotePDF } from "@/lib/pdfGenerator";
import { getQuoteForPdf } from "../actions";
import { Download, Edit, Eye, Loader2 } from "lucide-react";

type QuoteInList = Quote & {
  client: Client | null; 
};

type FullQuoteForPdf = Quote & {
  client: Client;
  prestation: Prestation | null;
};

export function QuoteList({ quotes, companyInfo }: { quotes: QuoteInList[]; companyInfo: CompanyInfo }) {
  const [loadingQuoteId, setLoadingQuoteId] = useState<string | null>(null);

  const handleDownload = async (quoteId: string) => {
    setLoadingQuoteId(quoteId);
    try {
      const fullQuote = await getQuoteForPdf(quoteId);
      if (!fullQuote) {
        throw new Error("Devis complet non trouvé pour la génération du PDF.");
      }
      generateQuotePDF(fullQuote, companyInfo);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
    } finally {
      setLoadingQuoteId(null);
    }
  };

  const formatDate = (date: Date) => new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date));
  const formatCurrency = (amount: number) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount || 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT': return <span className="px-2.5 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full dark:bg-yellow-900 dark:text-yellow-300">Brouillon</span>;
      case 'SENT': return <span className="px-2.5 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">Envoyé</span>;
      case 'ACCEPTED': return <span className="px-2.5 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-300">Accepté</span>;
      case 'REFUSED': return <span className="px-2.5 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full dark:bg-red-900 dark:text-red-300">Refusé</span>;
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
          {quotes.map((quote) => (
            <tr key={quote.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
              <td className="p-4 text-sm font-semibold text-gray-800 dark:text-dark-text">{quote.quoteNumber}</td>
              
              {/* CORRECTION : On utilise `quote.client.nom` au lieu de `quote.client.name` */}
              <td className="p-4 text-sm text-gray-600 dark:text-dark-subtle">
                {quote.client ? quote.client.nom : <span className="text-red-500">Client non trouvé</span>}
              </td>

              <td className="p-4 text-sm text-gray-600 dark:text-dark-subtle">{formatDate(quote.date)}</td>
              <td className="p-4 text-sm font-medium text-gray-800 dark:text-dark-text">{formatCurrency(quote.totalTTC)}</td>
              <td className="p-4">{getStatusBadge(quote.status)}</td>
              <td className="p-4">
                <div className="flex items-center justify-center gap-2">
                  <Link href={`/administration/quotes/${quote.id}`} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-dark-subtle dark:hover:bg-gray-700">
                    <Eye size={16} />
                  </Link>
                  <button 
                    onClick={() => handleDownload(quote.id)} 
                    disabled={loadingQuoteId === quote.id}
                    className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-dark-subtle dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingQuoteId === quote.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Download size={16} />
                    )}
                  </button>
                  {quote.status !== 'ACCEPTED' && (
                    <>
                      <Link href={`/administration/quotes/${quote.id}/edit`} className="p-2 rounded-full text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-gray-700">
                        <Edit size={16} />
                      </Link>
                      <DeleteQuoteButton quoteId={quote.id} />
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {quotes.length === 0 && (
          <p className="py-8 text-center text-gray-500 dark:text-dark-subtle">Aucun devis trouvé.</p>
      )}
    </div>
  );
}