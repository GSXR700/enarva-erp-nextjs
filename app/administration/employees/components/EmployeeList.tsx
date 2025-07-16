// enarva-nextjs-app/app/administration/employees/components/EmployeeList.tsx
"use client";

import { useState, useEffect } from "react";
import type { Employee, PayRate, Role, Department, User } from "@prisma/client";
import { EmployeeFormModal } from "./EmployeeFormModal";
import { DeleteEmployeeButton } from "./DeleteEmployeeButton";
import { Edit } from "lucide-react";

// CORRECTION : Le type accepte maintenant que `email` puisse être `null`
type EmployeeWithUser = Employee & {
  user: {
    email: string | null;
    role: Role;
    departmentId: string | null;
  };
};

interface EmployeeListProps {
  employees: EmployeeWithUser[];
  payRates: PayRate[];
  departments: Department[];
}

export function EmployeeList({ employees, payRates, departments }: EmployeeListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeWithUser | null>(null);

  const handleEdit = (employee: EmployeeWithUser) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };
  
  useEffect(() => {
    (window as any).openEmployeeModal = (employee: EmployeeWithUser | null = null) => {
        setEditingEmployee(employee);
        setIsModalOpen(true);
    };
    return () => {
      delete (window as any).openEmployeeModal;
    }
  }, []);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-200 dark:border-dark-border">
            <tr>
              <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Nom Complet</th>
              <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Email</th>
              <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Téléphone</th>
              <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Rôle</th>
              <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
            {employees.map((employee) => (
              <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                <td className="p-4 text-sm font-medium text-gray-800 dark:text-dark-text">{`${employee.firstName} ${employee.lastName}`}</td>
                <td className="p-4 text-sm text-gray-600 dark:text-dark-subtle">{employee.user.email || "-"}</td>
                <td className="p-4 text-sm text-gray-600 dark:text-dark-subtle">{employee.phone || "-"}</td>
                <td className="p-4 text-sm text-gray-600 dark:text-dark-subtle">{employee.user.role}</td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-4">
                    <button onClick={() => handleEdit(employee)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                      <Edit size={16} />
                    </button>
                    <DeleteEmployeeButton employeeId={employee.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {employees.length === 0 && (
          <p className="text-center text-gray-500 py-8 dark:text-dark-subtle">Aucun employé trouvé.</p>
      )}

      <EmployeeFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employee={editingEmployee}
        payRates={payRates}
        departments={departments}
      />
    </>
  );
}