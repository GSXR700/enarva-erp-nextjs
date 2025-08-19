"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Calendar, User, FileText } from "lucide-react";
import { saveMission } from "../../actions";
import { toast } from "sonner";
import type { Order, Client, Employee, User as PrismaUser } from "@prisma/client";

type OrderWithClient = Order & { client: Client };
type EmployeeWithUser = Employee & { user: { name: string | null } };

interface NewMissionFormProps {
  orders: OrderWithClient[];
  employees: EmployeeWithUser[];
}

export function NewMissionForm({ orders, employees }: NewMissionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasOrder, setHasOrder] = useState(true);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(event.currentTarget);

    if (!hasOrder) {
      formData.delete('orderId');
    }

    const result = await saveMission(formData);

    if (result.success) {
      toast.success("Mission créée avec succès");
      router.push('/administration/missions');
    } else {
      if (result.errors) {
        Object.values(result.errors).forEach(errorArray => {
          errorArray.forEach(error => toast.error(error));
        });
      } else {
        toast.error(result.message || "Erreur lors de la création");
      }
    }
    setIsSubmitting(false);
  };

  const formatDateForInput = (date?: Date | null) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Mobile-first header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors p-2 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          <span className="hidden sm:inline">Retour</span>
        </button>
        
        <div className="text-center flex-1 mx-4">
          <h1 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
            Nouvelle Mission
          </h1>
          <p className="text-sm text-gray-500 dark:text-dark-subtle hidden md:block">
            Planifier une intervention
          </p>
        </div>
        
        <div className="w-10"></div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-dark-container rounded-lg shadow-sm border border-gray-200 dark:border-dark-border">
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6">
          
          {/* Mission Type */}
          <div className="bg-gray-50 dark:bg-dark-background p-4 rounded-lg">
            <h3 className="font-medium text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Type de mission
            </h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="missionType"
                  value="withOrder"
                  checked={hasOrder}
                  onChange={() => setHasOrder(true)}
                  className="mr-2"
                />
                <span className="text-sm">Mission liée à une commande</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="missionType"
                  value="standalone"
                  checked={!hasOrder}
                  onChange={() => setHasOrder(false)}
                  className="mr-2"
                />
                <span className="text-sm">Mission indépendante</span>
              </label>
            </div>
          </div>

          {/* Order Selection */}
          {hasOrder && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Commande associée *
              </label>
              <select
                name="orderId"
                required={hasOrder}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-background dark:border-dark-border dark:text-white"
              >
                <option value="">Sélectionner une commande</option>
                {orders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.orderNumber} - {order.client.nom}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Mission Title (for standalone missions) */}
          {!hasOrder && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Titre de la mission *
              </label>
              <input
                name="title"
                required={!hasOrder}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-background dark:border-dark-border dark:text-white"
                placeholder="Ex: Nettoyage bureaux - Intervention ponctuelle"
              />
            </div>
          )}

          {/* Employee Assignment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              Employé assigné *
            </label>
            <select
              name="assignedToId"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-background dark:border-dark-border dark:text-white"
            >
              <option value="">Sélectionner un employé</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName}
                  {employee.user.name && ` (${employee.user.name})`}
                </option>
              ))}
            </select>
          </div>

          {/* Scheduling */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="font-medium text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Planification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Début prévu *
                </label>
                <input
                  name="scheduledStart"
                  type="datetime-local"
                  required
                  defaultValue={formatDateForInput(new Date())}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-background dark:border-dark-border dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fin prévue
                </label>
                <input
                  name="scheduledEnd"
                  type="datetime-local"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-background dark:border-dark-border dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Instructions / Notes
            </label>
            <textarea
              name="notes"
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-background dark:border-dark-border dark:text-white"
              placeholder="Instructions spécifiques pour cette mission..."
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-dark-border">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 sm:flex-none px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors dark:border-dark-border dark:text-gray-300 dark:hover:bg-dark-highlight-bg"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Création...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Créer la mission</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}