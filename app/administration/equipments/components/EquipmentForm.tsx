// app/administration/equipment/components/EquipmentForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface EquipmentFormProps {
  equipment?: any; // Pour l'édition future
}

export function EquipmentForm({ equipment }: EquipmentFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.get('name'),
          type: formData.get('type'),
          serialNumber: formData.get('serialNumber'),
          purchaseDate: formData.get('purchaseDate'),
          status: formData.get('status') || 'IN_SERVICE',
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Erreur lors de la création de l\'équipement');
      }

      const newEquipment = await response.json();
      router.push('/administration/equipments');
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
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
            Nom de l'Équipement *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            defaultValue={equipment?.name || ''}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text"
            placeholder="Ex: Monobrosse Kärcher BR40/10"
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
            Type d'Équipement *
          </label>
          <input
            type="text"
            id="type"
            name="type"
            required
            defaultValue={equipment?.type || ''}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text"
            placeholder="Ex: Monobrosse, Aspirateur industriel, Nettoyeur haute pression"
          />
        </div>

        <div>
          <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
            Numéro de Série
          </label>
          <input
            type="text"
            id="serialNumber"
            name="serialNumber"
            defaultValue={equipment?.serialNumber || ''}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text"
            placeholder="Numéro de série unique"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
            Statut
          </label>
          <select
            id="status"
            name="status"
            defaultValue={equipment?.status || 'IN_SERVICE'}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text"
          >
            <option value="IN_SERVICE">En Service</option>
            <option value="MAINTENANCE">En Maintenance</option>
            <option value="OUT_OF_ORDER">Hors Service</option>
            <option value="RETIRED">Retiré</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
            Date d'Achat
          </label>
          <input
            type="date"
            id="purchaseDate"
            name="purchaseDate"
            defaultValue={equipment?.purchaseDate ? new Date(equipment.purchaseDate).toISOString().split('T')[0] : ''}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text"
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
          {equipment ? 'Modifier' : 'Créer'} l'Équipement
        </button>
      </div>
    </form>
  );
}