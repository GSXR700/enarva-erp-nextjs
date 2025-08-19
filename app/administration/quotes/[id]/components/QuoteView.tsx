// app/administration/quotes/[id]/QuoteView.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Check, Edit, Trash2, Send } from 'lucide-react';
import { toast } from 'sonner';

interface QuoteViewProps {
  quote: any; // Type selon votre schema Prisma
  isOwner: boolean;
  canEdit: boolean;
}

export function QuoteView({ quote, isOwner, canEdit }: QuoteViewProps) {
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleValidate = async () => {
    setIsValidating(true);
    try {
      const response = await fetch(`/api/quotes/${quote.id}/validate`, {
        method: 'POST',
      });
      if (response.ok) {
        toast.success('Devis validé avec succès');
        router.refresh();
      } else {
        toast.error('Erreur lors de la validation');
      }
    } catch (error) {
      toast.error('Erreur lors de la validation');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSend = async () => {
    setIsSending(true);
    try {
      const response = await fetch(`/api/quotes/${quote.id}/send`, {
        method: 'POST',
      });
      if (response.ok) {
        toast.success('Devis envoyé au client');
        router.refresh();
      } else {
        toast.error("Erreur lors de l'envoi");
      }
    } catch (error) {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/quotes/${quote.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        toast.success('Devis supprimé');
        router.push('/administration/quotes');
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = () => {
    window.open(`/api/quotes/${quote.id}/pdf`, '_blank');
  };

  return (
    <>
      {/* Header avec boutons - Mobile responsive */}
      <div className="bg-white dark:bg-dark-container rounded-lg shadow-sm mb-6 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Retour</span>
          </button>

          {/* Actions groupées - Responsive grid */}
          <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3">
            {/* Bouton Télécharger */}
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-highlight-bg transition-colors text-sm sm:text-base"
            >
              <Download size={18} />
              <span>Télécharger</span>
            </button>

            {/* Bouton Valider (si brouillon) */}
            {quote.status === 'DRAFT' && canEdit && (
              <button
                onClick={handleValidate}
                disabled={isValidating}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                <Check size={18} />
                <span>{isValidating ? 'Validation...' : 'Valider'}</span>
              </button>
            )}

            {/* Bouton Envoyer (si validé) */}
            {quote.status === 'VALIDATED' && canEdit && (
              <button
                onClick={handleSend}
                disabled={isSending}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                <Send size={18} />
                <span>{isSending ? 'Envoi...' : 'Envoyer'}</span>
              </button>
            )}

            {/* Boutons Modifier et Supprimer */}
            {canEdit && (
              <>
                <button
                  onClick={() => router.push(`/administration/quotes/${quote.id}/edit`)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm sm:text-base"
                >
                  <Edit size={18} />
                  <span className="hidden sm:inline">Modifier</span>
                </button>

                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  <Trash2 size={18} />
                  <span className="hidden sm:inline">{isDeleting ? 'Suppression...' : 'Supprimer'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Document View - Mobile optimized */}
      <div className="bg-white dark:bg-dark-container rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* En-tête du document */}
          <div className="flex flex-col sm:flex-row sm:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Devis {quote.quoteNumber}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Créé le {new Date(quote.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="flex items-start">
              <StatusBadge status={quote.status} />
            </div>
          </div>

          {/* Informations client/fournisseur - Responsive */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 dark:bg-dark-surface p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">De:</h3>
              <p className="font-semibold">{quote.company?.name || 'Enarva SARL AU'}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {quote.company?.address || '53, 2ème étage, Appt 15, Av. Brahim Roudani, Océan, Rabat'}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-dark-surface p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Pour:</h3>
              <p className="font-semibold">{quote.client.nom}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{quote.client.adresse}</p>
              {quote.client.email && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{quote.client.email}</p>
              )}
            </div>
          </div>

          {/* Tableau des articles - Scrollable sur mobile */}
          <div className="mb-8 overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50 dark:bg-dark-surface">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Désignation
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Quantité
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    P.U.
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total HT
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                {quote.items.map((item: any, index: number) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                      {item.designation}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-gray-300">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-300">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-gray-300">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-dark-surface">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300">
                    Total HT:
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">
                    {formatCurrency(quote.totalHT)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300">
                    TVA (20%):
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">
                    {formatCurrency(quote.tva)}
                  </td>
                </tr>
                <tr className="text-lg">
                  <td colSpan={3} className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">
                    Total TTC:
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(quote.totalTTC)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Notes */}
          {quote.notes && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">Notes:</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-400 whitespace-pre-wrap">
                {quote.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Composant Badge de statut
function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    DRAFT: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', label: 'Brouillon' },
    VALIDATED: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300', label: 'Validé' },
    SENT: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300', label: 'Envoyé' },
    ACCEPTED: { color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300', label: 'Accepté' },
    REJECTED: { color: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300', label: 'Rejeté' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}

// Fonction de formatage de devise
function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
  }).format(amount);
}
