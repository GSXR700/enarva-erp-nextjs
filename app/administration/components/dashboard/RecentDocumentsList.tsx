// app/administration/components/dashboard/RecentDocumentsList.tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface DocumentItem {
  id: string;
  number: string;
  clientName: string;
  amount: number;
  status: string;
}

interface RecentDocumentsListProps {
  title: string;
  items: DocumentItem[];
  viewAllLink: string;
  type: 'quote' | 'invoice';
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount);

const getStatusBadge = (status: string, type: 'quote' | 'invoice') => {
    const base = "px-2 py-0.5 text-xs font-medium rounded-full";
    if (type === 'quote') {
        switch (status) {
            case 'DRAFT': return <span className={`${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300`}>Brouillon</span>;
            case 'SENT': return <span className={`${base} bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300`}>Envoyé</span>;
            case 'ACCEPTED': return <span className={`${base} bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300`}>Accepté</span>;
            default: return <span className={`${base} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`}>{status}</span>;
        }
    } else {
         switch (status) {
            case 'DRAFT': return <span className={`${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300`}>Brouillon</span>;
            case 'SENT': return <span className={`${base} bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300`}>Envoyée</span>;
            case 'PAID': return <span className={`${base} bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300`}>Payée</span>;
            default: return <span className={`${base} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`}>{status}</span>;
        }
    }
};

export function RecentDocumentsList({ title, items, viewAllLink, type }: RecentDocumentsListProps) {
  return (
    <div className="bg-white dark:bg-dark-container p-6 rounded-2xl shadow-md h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
        <Link href={viewAllLink} className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
          Voir tout <ArrowRight size={14} />
        </Link>
      </div>
      <div className="flex-grow">
        {items.length > 0 ? (
            <ul className="divide-y divide-gray-100 dark:divide-dark-border">
            {items.map(item => (
                <li key={item.id} className="py-3">
                  <Link href={`${viewAllLink}/${item.id}`} className="flex justify-between items-center group">
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-dark-text group-hover:text-primary transition-colors">{item.number}</p>
                      <p className="text-xs text-gray-500 dark:text-dark-subtle">{item.clientName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800 dark:text-dark-text">{formatCurrency(item.amount)}</p>
                      {getStatusBadge(item.status, type)}
                    </div>
                  </Link>
                </li>
            ))}
            </ul>
        ) : (
            <div className="flex items-center justify-center h-full text-sm text-gray-400 dark:text-dark-subtle">
                <p>Aucun document récent.</p>
            </div>
        )}
      </div>
    </div>
  );
}