// app/administration/components/search/SearchResults.tsx
"use client";

import Link from 'next/link';
import { Loader2, Search } from 'lucide-react';

interface SearchResultItem {
  id: string;
  title: string;
  type: 'Client' | 'Devis' | 'Facture' | 'Commande' | 'BL';
}

interface SearchResultsProps {
  results: {
    clients: SearchResultItem[];
    quotes: SearchResultItem[];
    invoices: SearchResultItem[];
    orders: SearchResultItem[];
    deliveryNotes: SearchResultItem[];
  };
  isLoading: boolean;
  onClose: () => void;
}

const typeToPathMap = {
  Client: '/administration/clients/',
  Devis: '/administration/quotes/',
  Facture: '/administration/invoices/',
  Commande: '/administration/missions/', // Les commandes mènent aux missions
  BL: '/administration/delivery-notes/',
};

export const SearchResults = ({ results, isLoading, onClose }: SearchResultsProps) => {
  const allResults = [
    ...results.clients,
    ...results.quotes,
    ...results.invoices,
    ...results.orders,
    ...results.deliveryNotes,
  ];

  const renderResultGroup = (items: SearchResultItem[], title: string) => {
    if (items.length === 0) return null;
    return (
      <div>
        <h4 className="text-xs font-bold text-gray-400 uppercase px-4 pt-3 pb-1">{title}</h4>
        <ul>
          {items.map((item) => (
            <li key={`${item.type}-${item.id}`}>
              <Link
                href={`${typeToPathMap[item.type]}${item.id}`}
                onClick={onClose}
                className="block px-4 py-2 text-sm text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface"
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="absolute top-full mt-2 w-full rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-dark-surface dark:ring-dark-border max-h-96 overflow-y-auto">
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        </div>
      ) : allResults.length > 0 ? (
        <div className="divide-y divide-gray-100 dark:divide-dark-border">
          {renderResultGroup(results.clients, 'Clients')}
          {renderResultGroup(results.quotes, 'Devis')}
          {renderResultGroup(results.invoices, 'Factures')}
          {renderResultGroup(results.orders, 'Commandes')}
          {renderResultGroup(results.deliveryNotes, 'Bons de Livraison')}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center">
            <Search className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-600 dark:text-dark-subtle">Aucun résultat trouvé.</p>
            <p className="text-xs text-gray-400 dark:text-dark-subtle mt-1">Essayez un nom de client ou un numéro de document.</p>
        </div>
      )}
    </div>
  );
};