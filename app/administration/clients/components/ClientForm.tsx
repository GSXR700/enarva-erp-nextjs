// app/administration/clients/components/ClientForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface ClientFormProps {
  client?: any; // Pour l'édition future
}

export function ClientForm({ client }: ClientFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nom: formData.get('nom'),
          email: formData.get('email'),
          telephone: formData.get('telephone'),
          address: formData.get('address'),
          type: formData.get('type'),
          status: 'ACTIF',
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Erreur lors de la création du client');
      }

      const newClient = await response.json();
      router.push('/administration/clients');
      router.refresh();

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
            Nom du Client *
          </label>
          <input
            type="text"
            id="nom"
            name="nom"
            required
            defaultValue={client?.nom || ''}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text"
            placeholder="Nom de l'entreprise ou du particulier"
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
            Type de Client *
          </label>
          <select
            id="type"
            name="type"
            required
            defaultValue={client?.type || 'PARTICULIER'}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text"
          >
            <option value="PARTICULIER">Particulier</option>
            <option value="ENTREPRISE">Entreprise</option>
            <option value="INSTITUTION">Institution</option>
          </select>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            defaultValue={client?.email || ''}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text"
            placeholder="client@exemple.com"
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
            defaultValue={client?.telephone || ''}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text"
            placeholder="+212 6XX XXX XXX"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
            Adresse
          </label>
          <textarea
            id="address"
            name="address"
            rows={3}
            defaultValue={client?.address || ''}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text"
            placeholder="Adresse complète du client"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
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
          {client ? 'Modifier' : 'Créer'} le Client
        </button>
      </div>
    </form>
  );
}