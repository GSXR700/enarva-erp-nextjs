// enarva-nextjs-dashboard-app/app/administration/quotes/[id]/components/QuoteView.tsx
"use client";
import type { Quote, Client, CompanyInfo, Prestation, JuridicState } from "@prisma/client";
import { useState } from "react";
import Link from "next/link";
import { generateQuotePDF } from "@/lib/pdfGenerator";
import { ConfirmationModal } from "./ConfirmationModal";
import { Download, CheckCircle, Edit, AlertTriangle, Check } from "lucide-react";

// Types pour les items de devis
type QuoteItem = {
  designation: string;
  quantity: string;
  unitPrice: string;
  total: number;
};

type LegacyQuoteItem = {
  designation: string;
  qte: number;
  pu_ht: number;
  total_ht: number;
};

type QuoteWithDetails = Quote & { 
  client: Client;
  prestation: Prestation | null;
};

// ✅ INTERFACE CRITIQUE: Cette interface manquait et causait l'erreur de build
interface QuoteViewProps {
  quote: QuoteWithDetails;
  companyInfo: CompanyInfo;
}

const JuridicStateBadge = ({ state }: { state: JuridicState }) => {
  if (state === 'BLACK') {
    return (
      <span className="flex items-center gap-1.5 text-sm bg-yellow-100 text-yellow-800 font-medium px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">
        <AlertTriangle size={14} />
        Facturation Hors Taxe
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-sm bg-green-100 text-green-800 font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
      <Check size={14} />
      Légal (TVA Applicable)
    </span>
  );
};

// ✅ CORRECTION: Utilisation de l'interface QuoteViewProps au lieu de l'interface inline
export function QuoteView({ quote, companyInfo }: QuoteViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const formatDate = (date: Date) => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(date));
  const formatCurrency = (amount: number | null | undefined) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount || 0);
  
  const items = (quote.items as (QuoteItem | LegacyQuoteItem)[]).map(item => {
    // Normalize legacy items to new format
    if ('qte' in item) {
      return {
        designation: item.designation,
        quantity: String(item.qte),
        unitPrice: String(item.pu_ht),
        total: item.total_ht
      };
    }
    return item;
  });

  const handleDownload = () => {
    generateQuotePDF(quote, companyInfo);
  };

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">
                Devis {quote.quoteNumber}
              </h1>
              <JuridicStateBadge state={quote.juridicState} />
            </div>
            <p className="text-gray-500 dark:text-dark-subtle mt-1">
              Créé le {formatDate(quote.date)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link 
              href="/administration/quotes" 
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 dark:bg-dark-container dark:text-dark-subtle dark:border-dark-border dark:hover:bg-dark-surface"
            >
              Retour
            </Link>
            <button 
              onClick={handleDownload} 
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 dark:bg-dark-container dark:text-dark-subtle dark:border-dark-border dark:hover:bg-dark-surface"
            >
              <Download className="mr-2 h-4 w-4"/>
              Télécharger
            </button>
            {quote.status !== 'ACCEPTED' && (
              <>
                <Link 
                  href={`/administration/quotes/${quote.id}/edit`} 
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700"
                >
                  <Edit className="mr-2 h-4 w-4"/>
                  Modifier
                </Link>
                <button 
                  onClick={() => setIsModalOpen(true)} 
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:opacity-90"
                >
                  <CheckCircle className="mr-2 h-4 w-4"/>
                  Accepter
                </button>
              </>
            )}
          </div>
        </div>

        <div className="p-8 bg-white rounded-lg shadow-md dark:bg-dark-container">
          <div className="grid grid-cols-2 gap-8 pb-8 border-b border-gray-200 dark:border-dark-border">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">De:</h3>
              <p className="mt-2 text-gray-600 dark:text-dark-subtle">{companyInfo.companyName}</p>
              <p className="text-gray-600 dark:text-dark-subtle">{companyInfo.address}</p>
            </div>
            <div className="text-right">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">Pour:</h3>
              <p className="mt-2 font-medium text-gray-700 dark:text-dark-text">{quote.client.nom}</p>
              <p className="text-gray-600 dark:text-dark-subtle">
                {quote.client.adresse || 'Adresse non spécifiée'}
              </p>
            </div>
          </div>

          <div className="my-8 space-y-4">
            {quote.object && (
              <>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">Objet:</h3>
                <p className="mt-1 text-gray-600 dark:text-dark-subtle">{quote.object}</p>
              </>
            )}
            {quote.prestation?.prestationsIncluses && (
              <>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text mt-4">
                  Détails de la prestation:
                </h3>
                <p className="mt-1 text-gray-600 dark:text-dark-subtle whitespace-pre-wrap">
                  {quote.prestation.prestationsIncluses}
                </p>
              </>
            )}
            {quote.prestation?.delaiPrevu && (
              <>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text mt-4">
                  Durée prévue:
                </h3>
                <p className="mt-1 text-gray-600 dark:text-dark-subtle">
                  {quote.prestation.delaiPrevu}
                </p>
              </>
            )}
          </div>

          <div className="mt-8">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-dark-border">
                  <th className="p-2 text-left text-sm font-medium text-gray-500 dark:text-dark-subtle">
                    Désignation
                  </th>
                  <th className="p-2 text-center text-sm font-medium text-gray-500 dark:text-dark-subtle">
                    Quantité
                  </th>
                  <th className="p-2 text-right text-sm font-medium text-gray-500 dark:text-dark-subtle">
                    P.U. HT
                  </th>
                  <th className="p-2 text-right text-sm font-medium text-gray-500 dark:text-dark-subtle">
                    Total HT
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className="p-2 text-gray-800 dark:text-dark-text">{item.designation}</td>
                    <td className="p-2 text-center text-gray-600 dark:text-dark-subtle">
                      {item.quantity}
                    </td>
                    <td className="p-2 text-right text-gray-600 dark:text-dark-subtle">
                      {formatCurrency(parseFloat(item.unitPrice))}
                    </td>
                    <td className="p-2 text-right font-medium text-gray-800 dark:text-dark-text">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-end mt-8">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-gray-600 dark:text-dark-subtle">
                <span>Total HT</span>
                <span>{formatCurrency(quote.totalHT)}</span>
              </div>
              
              {/* ✅ CORRECTION: Utilisation de 'LEGAL' au lieu de 'WHITE' selon votre schéma Prisma */}
              {quote.juridicState === 'LEGAL' && (
                <>
                  <div className="flex justify-between text-gray-600 dark:text-dark-subtle">
                    <span>TVA (20%)</span>
                    <span>{formatCurrency(quote.tva)}</span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-gray-200 dark:border-dark-border flex justify-between font-bold text-lg text-gray-800 dark:text-dark-text">
                    <span>Total TTC</span>
                    <span>{formatCurrency(quote.totalTTC)}</span>
                  </div>
                </>
              )}
              
              {/* Pour les clients en juridicState BLACK (hors TVA) */}
              {quote.juridicState === 'BLACK' && (
                <div className="pt-2 mt-2 border-t border-gray-200 dark:border-dark-border flex justify-between font-bold text-lg text-gray-800 dark:text-dark-text">
                  <span>Total HT (Hors TVA)</span>
                  <span>{formatCurrency(quote.totalHT)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <ConfirmationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        quoteId={quote.id} 
      />
    </>
  );
}
