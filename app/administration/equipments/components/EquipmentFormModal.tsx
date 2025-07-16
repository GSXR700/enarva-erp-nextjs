"use client";

import { useState, useRef, useEffect } from "react";
import type { Equipment } from "@prisma/client";
import { saveEquipment } from "../actions";
import { Loader2 } from "lucide-react";
import { EquipmentStatus } from "@prisma/client";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment | null;
}

export function EquipmentFormModal({ isOpen, onClose, equipment }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isOpen) { formRef.current?.reset(); }
  }, [isOpen]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    await saveEquipment(formData);
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="w-full max-w-2xl m-4 bg-white rounded-lg shadow-xl dark:bg-dark-container">
        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="flex items-center justify-between p-4 border-b dark:border-dark-border">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-dark-text">
              {equipment ? "Modifier l'Équipement" : "Nouveau Matériel"}
            </h3>
            <button type="button" onClick={onClose} className="text-3xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">&times;</button>
          </div>
          <div className="p-6 space-y-4">
            <input type="hidden" name="id" defaultValue={equipment?.id || ""} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Nom du Matériel</label>
                <input id="name" name="name" defaultValue={equipment?.name || ""} placeholder="Ex: Monobrosse Numatic" className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border dark:text-dark-text" required />
              </div>
              <div>
                <label htmlFor="type" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Type</label>
                <input id="type" name="type" defaultValue={equipment?.type || ""} placeholder="Ex: Nettoyage Sols" className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border dark:text-dark-text" required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="serialNumber" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">N° de Série</label>
                <input id="serialNumber" name="serialNumber" defaultValue={equipment?.serialNumber || ""} className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border dark:text-dark-text" />
              </div>
              <div>
                <label htmlFor="purchaseDate" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Date d'Achat</label>
                <input id="purchaseDate" name="purchaseDate" type="date" defaultValue={equipment?.purchaseDate ? new Date(equipment.purchaseDate).toISOString().split('T')[0] : ''} className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border dark:text-dark-text" />
              </div>
            </div>
            <div>
              <label htmlFor="status" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Statut</label>
              <select id="status" name="status" defaultValue={equipment?.status || EquipmentStatus.IN_SERVICE} className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border dark:text-dark-text" required>
                <option value={EquipmentStatus.IN_SERVICE}>En service</option>
                <option value={EquipmentStatus.IN_MAINTENANCE}>En maintenance</option>
                <option value={EquipmentStatus.OUT_OF_SERVICE}>Hors service</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end p-4 bg-gray-50 rounded-b-lg dark:bg-dark-surface">
            <button type="button" onClick={onClose} className="px-4 py-2 font-bold text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Annuler</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 ml-2 font-bold text-white bg-primary rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center">
              {isSubmitting && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
              Sauvegarder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}