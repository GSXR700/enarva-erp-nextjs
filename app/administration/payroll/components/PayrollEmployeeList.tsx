// app/administration/payroll/components/PayrollEmployeeList.tsx
"use client";

import type { Employee, User } from "@prisma/client";
import Link from "next/link";
import { UserAvatar } from "@/app/administration/components/UserAvatar";

type EmployeeWithUser = Employee & {
  user: {
    email: string | null;
    image: string | null;
  };
};

export function PayrollEmployeeList({ employees }: { employees: EmployeeWithUser[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="border-b border-gray-200 dark:border-dark-border">
          <tr>
            <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Employé</th>
            <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Email</th>
            <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Solde Actuel</th>
            <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
          {employees.map((employee) => (
            <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
              <td className="p-4">
                <Link href={`/administration/payroll/${employee.id}`} className="flex items-center gap-3 group">
                  <UserAvatar src={employee.user?.image} name={`${employee.firstName} ${employee.lastName}`} size={40} />
                  <span className="font-medium text-gray-800 dark:text-dark-text group-hover:text-primary group-hover:underline">
                    {`${employee.firstName} ${employee.lastName}`}
                  </span>
                </Link>
              </td>
              <td className="p-4 text-sm text-gray-600 dark:text-dark-subtle">{employee.user?.email || "-"}</td>
              <td className="p-4 text-sm font-bold text-gray-700 dark:text-dark-text">
                {/* Le calcul du solde sera ajouté ici via une autre tâche */}
                0,00 MAD
              </td>
              <td className="p-4">
                 <Link href={`/administration/payroll/${employee.id}`} className="text-sm font-medium text-primary hover:underline">
                  Voir détails
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {employees.length === 0 && (
        <p className="text-center text-gray-500 py-8 dark:text-dark-subtle">Aucun employé trouvé.</p>
      )}
    </div>
  );
}