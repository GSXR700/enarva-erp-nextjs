// app/administration/missions/components/MissionForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { saveMission } from "../actions";

interface MissionFormProps {
  orders: any[];
  employees: any[];
  mission?: any; // Pour l'édition future
}

export function MissionForm({ orders, employees, mission }: MissionFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await saveMission(formData);
      
      if (result.success) {
        router.push('/administration/missions');
        router.refresh();
      } else {
        setError(result.message || 'Une erreur est survenue');
      }

    } catch (error) {
      console.error('Erreur:', error);
      setError('Une erreur inattendue est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      {mission && (
        <input type="hidden" name="id" value={mission.id} />
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
            Commande Associée *
          </label>
          <select
            id="orderId"
            name="orderId"
            required
            defaultValue={mission?.orderId || ''}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text"
          >
            <option value="">Sélectionner une commande</option>
            {orders.map((order) => (
              <option key={order.id} value={order.id}>
                {order.client.nom} - {order.quote.object}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="assignedToId" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
            Employé Assigné *
          </label>
          <select
            id="assignedToId"
            name="assignedToId"
            required
            defaultValue={mission?.assignedToId || ''}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text"
          >
            <option value="">Sélectionner un employé</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.firstName} {employee.lastName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="scheduledStart" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
            Date et Heure de Début *
          </label>
          <input
            type="datetime-local"
            id="scheduledStart"
            name="scheduledStart"
            required
            defaultValue={mission?.scheduledStart ? new Date(mission.scheduledStart).toISOString().slice(0, 16) : ''}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text"
          />
        </div>

        <div>
          <label htmlFor="scheduledEnd" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
            Date et Heure de Fin *
          </label>
          <input
            type="datetime-local"
            id="scheduledEnd"
            name="scheduledEnd"
            required
            defaultValue={mission?.scheduledEnd ? new Date(mission.scheduledEnd).toISOString().slice(0, 16) : ''}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text"
          />
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
            Titre de la Mission
          </label>
          <input
            type="text"
            id="title"
            name="title"
            defaultValue={mission?.title || ''}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text"
            placeholder="Titre personnalisé (optionnel si commande sélectionnée)"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
            Notes sur la Mission
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={mission?.notes || ''}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text"
            placeholder="Notes additionnelles sur la mission..."
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
          {mission ? 'Modifier' : 'Créer'} la Mission
        </button>
      </div>
    </form>
  );
}