// app/administration/components/modals/MissionFormModal.tsx
"use client";

import { useEffect, useState } from 'react';
import { saveMission } from '@/app/administration/missions/actions';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import type { Order, Employee, Mission, Client } from '@prisma/client';

// Create a more specific type for an Order that includes the Client object.
type OrderWithClient = Order & {
    client: Client;
};

interface MissionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mission?: Mission | null;
  allOrders: OrderWithClient[]; // Use the new, more specific type
  allEmployees: Employee[];
}

export const MissionFormModal = ({ isOpen, onClose, mission, allOrders, allEmployees }: MissionFormModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasOrder, setHasOrder] = useState<boolean>(!!mission?.orderId || !mission);

  useEffect(() => {
    if (isOpen) {
      setHasOrder(!!mission?.orderId || !mission);
    } else {
      setIsSubmitting(false);
    }
  }, [isOpen, mission]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);

    if (!hasOrder) {
      formData.delete('orderId');
    } else {
      const selectedOrderId = formData.get('orderId');
      const selectedOrder = allOrders.find(o => o.id === selectedOrderId);
      if (selectedOrder) {
        // Set a default title when an order is linked
        formData.set('title', `Mission pour commande ${selectedOrder.orderNumber}`);
      }
    }

    const result = await saveMission(formData);

    if (result.success) {
        toast.success(result.message);
        onClose();
    } else {
        if(result.errors) {
            // Display all validation errors from the server
            Object.values(result.errors).forEach(errorArray => {
                errorArray.forEach(error => toast.error(error));
            });
        } else {
            toast.error(result.message);
        }
    }
    setIsSubmitting(false);
  };

  // Helper function to format dates correctly for datetime-local inputs
  const formatDateForInput = (date: Date | string | undefined | null) => {
    if (!date) return '';
    // Ensure the date is treated as local time, not UTC
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-container rounded-lg shadow-xl w-full max-w-lg">
        <form onSubmit={handleSubmit}>
            <div className="p-4 border-b dark:border-dark-border">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-text">{mission ? "Modifier la mission" : "Créer une nouvelle mission"}</h3>
            </div>
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {mission && <input type="hidden" name="id" value={mission.id} />}

              <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="hasOrder"
                    checked={hasOrder}
                    onChange={(e) => setHasOrder(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="hasOrder" className="text-sm font-medium text-gray-700 dark:text-dark-subtle">Lier à une commande existante</label>
              </div>

              {hasOrder ? (
                <div className="space-y-1">
                  <label htmlFor="orderId" className="text-sm font-medium text-gray-700 dark:text-dark-subtle">Commande Associée</label>
                  <select name="orderId" defaultValue={mission?.orderId || ''} required={hasOrder} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-dark-background dark:border-dark-border">
                    <option value="">Sélectionnez une commande</option>
                    {allOrders.map((order) => (
                      <option key={order.id} value={order.id}>{order.orderNumber} - {order.client.nom}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-1">
                  <label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-dark-subtle">Titre de la mission</label>
                  <input id="title" name="title" type="text" placeholder="Ex: Visite technique chez Client X" defaultValue={mission?.title || ''} required={!hasOrder} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-dark-background dark:border-dark-border"/>
                </div>
              )}

              <div className="space-y-1">
                <label htmlFor="assignedToId" className="text-sm font-medium text-gray-700 dark:text-dark-subtle">Employé Assigné</label>
                <select name="assignedToId" defaultValue={mission?.assignedToId} required className="w-full p-2 border rounded-md bg-gray-50 dark:bg-dark-background dark:border-dark-border">
                  <option value="">Sélectionnez un employé</option>
                  {allEmployees.map((employee) => (
                    <option key={employee.id} value={employee.id}>{employee.firstName} {employee.lastName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="scheduledStart" className="text-sm font-medium text-gray-700 dark:text-dark-subtle">Date et Heure de Début</label>
                    <input id="scheduledStart" name="scheduledStart" type="datetime-local" defaultValue={formatDateForInput(mission?.scheduledStart)} required className="w-full p-2 border rounded-md bg-gray-50 dark:bg-dark-background dark:border-dark-border"/>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="scheduledEnd" className="text-sm font-medium text-gray-700 dark:text-dark-subtle">Date et Heure de Fin</label>
                    <input id="scheduledEnd" name="scheduledEnd" type="datetime-local" defaultValue={formatDateForInput(mission?.scheduledEnd)} required className="w-full p-2 border rounded-md bg-gray-50 dark:bg-dark-background dark:border-dark-border"/>
                  </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-dark-subtle">Notes (Optionnel)</label>
                <textarea id="notes" name="notes" placeholder="Instructions spécifiques..." defaultValue={mission?.notes || ''} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-dark-background dark:border-dark-border min-h-[80px]"/>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 bg-gray-50 dark:bg-dark-surface rounded-b-lg">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200">Annuler</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-semibold text-white rounded-md bg-primary hover:opacity-90 disabled:opacity-50 flex items-center">
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {mission ? 'Enregistrer' : 'Créer'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};