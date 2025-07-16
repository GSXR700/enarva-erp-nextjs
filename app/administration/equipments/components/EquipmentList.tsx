"use client";

import { useState, useEffect } from "react";
import type { Equipment } from "@prisma/client";
import { EquipmentFormModal } from "./EquipmentFormModal";
import { Edit, Trash2 } from "lucide-react";
import { deleteEquipment } from "../actions";

export function EquipmentList({ equipments }: { equipments: Equipment[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);

  useEffect(() => {
    (window as any).openEquipmentModal = (equipment: Equipment | null = null) => {
      setEditingEquipment(equipment);
      setIsModalOpen(true);
    };
    return () => { delete (window as any).openEquipmentModal; };
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet équipement ?")) {
      await deleteEquipment(id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_SERVICE': return <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-300">En service</span>;
      case 'IN_MAINTENANCE': return <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full dark:bg-yellow-900 dark:text-yellow-300">En maintenance</span>;
      case 'OUT_OF_SERVICE': return <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full dark:bg-red-900 dark:text-red-300">Hors service</span>;
      default: return null;
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-200 dark:border-dark-border">
            <tr>
              <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Nom</th>
              <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Type</th>
              <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">N° de Série</th>
              <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Statut</th>
              <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
            {equipments.map((eq) => (
              <tr key={eq.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                <td className="p-4 font-medium text-gray-800 dark:text-dark-text">{eq.name}</td>
                <td className="p-4 text-sm text-gray-600 dark:text-dark-subtle">{eq.type}</td>
                <td className="p-4 text-sm text-gray-600 dark:text-dark-subtle">{eq.serialNumber || "-"}</td>
                <td className="p-4 text-sm">{getStatusBadge(eq.status)}</td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-4">
                    <button onClick={() => setEditingEquipment(eq)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(eq.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {equipments.length === 0 && <p className="p-4 text-center text-sm text-gray-400">Aucun équipement trouvé.</p>}
      </div>
      <EquipmentFormModal isOpen={isModalOpen || !!editingEquipment} onClose={() => { setIsModalOpen(false); setEditingEquipment(null); }} equipment={editingEquipment} />
    </>
  );
}