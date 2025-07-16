// app/administration/components/modals/MissionFormModal.tsx
"use client";

import { useEffect, useState } from 'react';
import { saveMission } from '@/app/administration/missions/actions';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import type { Order, Employee, Mission } from '@prisma/client';

interface MissionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mission?: Mission | null;
  allOrders: Order[];
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
      formData.set('orderId', '');
    } else {
      // CORRECTION: On doit s'assurer que le titre est bien renseigné même si une commande est sélectionnée
      const selectedOrderId = formData.get('orderId');
      const selectedOrder = allOrders.find(o => o.id === selectedOrderId);
      formData.set('title', `Mission pour commande ${selectedOrder?.orderNumber || ''}`);
    }

    const result = await saveMission(formData);

    if (result?.errors) {
      Object.values(result.errors).forEach(error => toast.error(error[0]));
    } else {
        toast.success(result.message);
        onClose();
    }
    setIsSubmitting(false);
  };

  const formatDateForInput = (date: Date | string | undefined) => {
    if (!date) return '';
    return new Date(date).toISOString().slice(0, 16);
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-container rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text">{mission ? "Modifier la mission" : "Créer une nouvelle mission"}</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {mission && <input type="hidden" name="id" value={mission.id} />}

          <div className="flex items-center space-x-2 mb-4">
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
              <select name="orderId" defaultValue={mission?.orderId || ''} required={hasOrder} className="w-full p-2 border border-gray-300 dark:border-dark-border rounded-md bg-gray-50 dark:bg-dark-background dark:text-dark-text focus:ring-2 focus:ring-primary">
                <option value="">Sélectionnez une commande</option>
                {allOrders.map((order) => (
                  <option key={order.id} value={order.id}>{order.orderNumber}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-1">
              <label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-dark-subtle">Titre de la mission</label>
              <input 
                id="title" 
                name="title" 
                type="text" 
                placeholder="Ex: Visite technique chez Client X"
                defaultValue={mission?.title || ''}
                required={!hasOrder}
                className="w-full p-2 border border-gray-300 dark:border-dark-border rounded-md bg-gray-50 dark:bg-dark-background dark:text-dark-text focus:ring-2 focus:ring-primary"
              />
            </div>
          )}
          
          <div className="space-y-1">
            <label htmlFor="assignedToId" className="text-sm font-medium text-gray-700 dark:text-dark-subtle">Employé Assigné</label>
            <select name="assignedToId" defaultValue={mission?.assignedToId} required className="w-full p-2 border border-gray-300 dark:border-dark-border rounded-md bg-gray-50 dark:bg-dark-background dark:text-dark-text focus:ring-2 focus:ring-primary">
              <option value="">Sélectionnez un employé</option>
              {allEmployees.map((employee) => (
                <option key={employee.id} value={employee.id}>{employee.firstName} {employee.lastName}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="scheduledStart" className="text-sm font-medium text-gray-700 dark:text-dark-subtle">Date et Heure de Début</label>
            <input 
              id="scheduledStart" 
              name="scheduledStart" 
              type="datetime-local" 
              defaultValue={formatDateForInput(mission?.scheduledStart)}
              required
              className="w-full p-2 border border-gray-300 dark:border-dark-border rounded-md bg-gray-50 dark:bg-dark-background dark:text-dark-text focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-dark-subtle">Notes (Optionnel)</label>
            <textarea 
              id="notes" 
              name="notes" 
              placeholder="Instructions spécifiques..."
              defaultValue={mission?.notes || ''}
              className="w-full p-2 border border-gray-300 dark:border-dark-border rounded-md bg-gray-50 dark:bg-dark-background dark:text-dark-text min-h-[80px] focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-md bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600">Annuler</button>
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