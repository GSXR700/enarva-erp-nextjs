"use client";

import { useState } from "react";
import type { Service, Department } from "@prisma/client";
import { deleteService } from "../actions";
import { ServiceFormModal } from "./ServiceFormModal";
import { PlusCircle, Edit, Trash2 } from "lucide-react";

interface ServiceManagementProps {
  services: Service[];
  departments: Department[];
}

export function ServiceManagement({ services, departments }: ServiceManagementProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const handleOpenModal = (service: Service | null = null) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce service ?")) {
      const result = await deleteService(id);
      if (result.error) {
        alert(result.error);
      }
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-dark-container rounded-lg shadow-md">
        <div className="p-4 border-b dark:border-dark-border flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg dark:text-dark-text">Catalogue de Services</h3>
            <p className="text-sm text-gray-500 dark:text-dark-subtle">Définissez les prestations proposées par votre entreprise.</p>
          </div>
          <button onClick={() => handleOpenModal()} className="flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80">
            <PlusCircle size={18} />
            <span>Nouveau Service</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-gray-200 dark:border-dark-border">
              <tr>
                <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Nom du Service</th>
                <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Famille</th>
                <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                  <td className="p-4 font-medium text-gray-800 dark:text-dark-text">{service.name}</td>
                  <td className="p-4 text-sm text-gray-600 dark:text-dark-subtle">{service.family}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-4">
                      <button onClick={() => handleOpenModal(service)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(service.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {services.length === 0 && <p className="p-4 text-center text-sm text-gray-400">Aucun service défini.</p>}
        </div>
      </div>

      <ServiceFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        service={editingService}
        departments={departments}
      />
    </>
  );
}