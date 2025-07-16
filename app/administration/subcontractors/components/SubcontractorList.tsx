"use client";

import { useState, useEffect } from "react";
import type { Subcontractor } from "@prisma/client";
import { SubcontractorFormModal } from "./SubcontractorFormModal";
import { Edit, Trash2 } from "lucide-react";
import { deleteSubcontractor } from "../actions";

export function SubcontractorList({ subcontractors }: { subcontractors: Subcontractor[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubcontractor, setEditingSubcontractor] = useState<Subcontractor | null>(null);

  useEffect(() => {
    (window as any).openSubcontractorModal = (subcontractor: Subcontractor | null = null) => {
      setEditingSubcontractor(subcontractor);
      setIsModalOpen(true);
    };
    return () => { delete (window as any).openSubcontractorModal; };
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce sous-traitant ?")) {
      await deleteSubcontractor(id);
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-200 dark:border-dark-border">
            <tr>
              <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Nom</th>
              <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Service</th>
              <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Contact</th>
              <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Téléphone</th>
              <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
            {subcontractors.map((sub) => (
              <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                <td className="p-4 font-medium text-gray-800 dark:text-dark-text">{sub.name}</td>
                <td className="p-4 text-sm text-gray-600 dark:text-dark-subtle">{sub.serviceType}</td>
                <td className="p-4 text-sm text-gray-600 dark:text-dark-subtle">{sub.contact || "-"}</td>
                <td className="p-4 text-sm text-gray-600 dark:text-dark-subtle">{sub.phone || "-"}</td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-4">
                    <button onClick={() => setEditingSubcontractor(sub)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(sub.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {subcontractors.length === 0 && <p className="p-4 text-center text-sm text-gray-400">Aucun sous-traitant trouvé.</p>}
      </div>
      <SubcontractorFormModal isOpen={isModalOpen || !!editingSubcontractor} onClose={() => { setIsModalOpen(false); setEditingSubcontractor(null); }} subcontractor={editingSubcontractor} />
    </>
  );
}