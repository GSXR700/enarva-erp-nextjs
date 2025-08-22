// app/administration/leads/components/LeadForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { LeadCanal, LeadType, LeadStatus } from "@prisma/client";

interface LeadFormProps {
  users: { id: string; name: string | null }[];
  subcontractors: { id: string; name: string }[];
  lead?: any; // Pour l'édition
  initialData?: any; // Pour la compatibilité avec l'ancien code
  onFormSubmit?: () => void; // Pour la compatibilité avec l'ancien code
}

export function LeadForm({ users, subcontractors, lead, initialData, onFormSubmit }: LeadFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Utiliser lead ou initialData pour la compatibilité
  const editData = lead || initialData;
  const isEditMode = !!editData;

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = isEditMode ? `/api/leads/${editData.id}` : '/api/leads';
      const method = isEditMode ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nom: formData.get('nom'),
          telephone: formData.get('telephone'),
          email: formData.get('email'),
          canal: formData.get('canal'),
          type: formData.get('type'),
          statut: formData.get('statut') || 'new_lead',
          source: formData.get('source'),
          commentaire: formData.get('commentaire'),
          quoteObject: formData.get('quoteObject'),
          assignedToId: formData.get('assignedToId') || null,
          date_intervention: formData.get('date_intervention') || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || `Erreur lors de ${isEditMode ? 'la modification' : 'la création'} du prospect`);
      }

      const result = await response.json();
      
      // Si c'est une fonction callback (ancien comportement)
      if (onFormSubmit) {
        onFormSubmit();
      } else {
        // Nouveau comportement - redirection automatique
        router.push('/administration/leads');
        router.refresh();
      }

    } catch (error) {
      console.error('Erreur:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="nom" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
            Nom du Contact *
          </label>
          <input
            type="text"
            id="nom"
            name="nom"
            required
            defaultValue={editData?.nom || ''}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text"
            placeholder="Nom complet ou entreprise"
          />
        </div>

        <div>
          <label htmlFor="quoteObject" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
            Objet du Devis *
          </label>
          <input
            type="text"
            id="quoteObject"
            name="quoteObject"
            required
            defaultValue={editData?.quoteObject || ''}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text"
            placeholder="Ex: Nettoyage bureaux, Entretien villa..."
          />
        </div>

        <div>
          <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
            Téléphone
          </label>
          <input
            type="tel"
            id="telephone"
            name="telephone"
            defaultValue={editData?.telephone || ''}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text"
            placeholder="+212 6XX XXX XXX"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            defaultValue={editData?.email || ''}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text"
            placeholder="contact@exemple.com"
          />
        </div>

        <div>
          <label htmlFor="canal" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
            Canal d'Acquisition
          </label>
          <select
            id="canal"
            name="canal"
            defaultValue={editData?.canal || 'WHATSAPP'}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text"
          >
            <option value="WHATSAPP">WhatsApp</option>
            <option value="FACEBOOK">Facebook</option>
            <option value="INSTAGRAM">Instagram</option>
            <option value="SITE_WEB">Site Web</option>
            <option value="RECOMMANDATION_CLIENT">Recommandation Client</option>
            <option value="APPEL_TELEPHONIQUE">Appel Téléphonique</option>
            <option value="VISITE_BUREAU">Visite Bureau</option>
            <option value="MANUEL">Saisie Manuelle</option>
          </select>
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
            Type de Prospect
          </label>
          <select
            id="type"
            name="type"
            defaultValue={editData?.type || 'BtoC'}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text"
          >
            <option value="BtoC">BtoC (Particulier)</option>
            <option value="BtoB">BtoB (Entreprise)</option>
            <option value="CONTRAT">Contrat</option>
            <option value="SOUS_TRAITANCE">Sous-traitance</option>
          </select>
        </div>

        {isEditMode && (
          <div>
            <label htmlFor="statut" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
              Statut
            </label>
            <select
              id="statut"
              name="statut"
              defaultValue={editData?.statut || 'new_lead'}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text"
            >
              <option value="new_lead">Nouveau Prospect</option>
              <option value="to_qualify">À Qualifier</option>
              <option value="qualified">Qualifié</option>
              <option value="visit_scheduled">Visite Planifiée</option>
              <option value="quote_sent">Devis Envoyé</option>
              <option value="quote_accepted">Devis Accepté</option>
              <option value="quote_refused">Devis Refusé</option>
              <option value="client_confirmed">Client Confirmé</option>
            </select>
          </div>
        )}

        <div>
          <label htmlFor="assignedToId" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
            Assigné à
          </label>
          <select
            id="assignedToId"
            name="assignedToId"
            defaultValue={editData?.assignedToId || ''}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text"
          >
            <option value="">Non assigné</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="date_intervention" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
            Date d'Intervention Souhaitée
          </label>
          <input
            type="date"
            id="date_intervention"
            name="date_intervention"
            defaultValue={editData?.date_intervention ? new Date(editData.date_intervention).toISOString().split('T')[0] : ''}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="source" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
            Source Détaillée
          </label>
          <input
            type="text"
            id="source"
            name="source"
            defaultValue={editData?.source || ''}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text"
            placeholder="Ex: Publicité Facebook, Référencement Google, Bouche à oreille..."
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="commentaire" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
            Commentaire
          </label>
          <textarea
            id="commentaire"
            name="commentaire"
            rows={3}
            defaultValue={editData?.commentaire || ''}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text"
            placeholder="Notes additionnelles sur le prospect..."
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => onFormSubmit ? onFormSubmit() : router.back()}
          className="px-4 py-2 text-gray-600 dark:text-dark-subtle hover:text-gray-800 dark:hover:text-dark-text transition"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditMode ? 'Modifier' : 'Créer'} le Prospect
        </button>
      </div>
    </form>
  );
}