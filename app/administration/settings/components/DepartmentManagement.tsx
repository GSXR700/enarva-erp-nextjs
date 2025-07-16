"use client";

import { useState } from "react";
import type { Department } from "@prisma/client";
import { deleteDepartment } from "../actions";
import { DepartmentFormModal } from "./DepartmentFormModal";
import { PlusCircle, Edit, Trash2 } from "lucide-react";

export function DepartmentManagement({ departments }: { departments: Department[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  const handleOpenModal = (department: Department | null = null) => {
    setEditingDepartment(department);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce département ? Assurez-vous qu'aucun employé ou service n'y est rattaché.")) {
      const result = await deleteDepartment(id);
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
            <h3 className="font-semibold text-lg dark:text-dark-text">Départements de l'Entreprise</h3>
            <p className="text-sm text-gray-500 dark:text-dark-subtle">Structurez votre organisation en équipes.</p>
          </div>
          <button onClick={() => handleOpenModal()} className="flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80">
            <PlusCircle size={18} />
            <span>Nouveau Département</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-gray-200 dark:border-dark-border">
              <tr>
                <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Nom du Département</th>
                <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Description</th>
                <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
              {departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                  <td className="p-4 font-medium text-gray-800 dark:text-dark-text">{dept.name}</td>
                  <td className="p-4 text-sm text-gray-600 dark:text-dark-subtle">{dept.description || "-"}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-4">
                      <button onClick={() => handleOpenModal(dept)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(dept.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {departments.length === 0 && <p className="p-4 text-center text-sm text-gray-400">Aucun département défini.</p>}
        </div>
      </div>

      <DepartmentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        department={editingDepartment}
      />
    </>
  );
}