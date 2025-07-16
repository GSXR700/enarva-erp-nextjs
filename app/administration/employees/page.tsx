import prisma from "@/lib/prisma";
import { AddEmployeeButton } from "./components/AddEmployeeButton";
import { EmployeeList } from "./components/EmployeeList";
import { PaginationControls } from "../components/PaginationControls";

interface EmployeesPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function EmployeesPage({ searchParams }: EmployeesPageProps) {
  const page = Number(searchParams["page"]) || 1;
  const itemsPerPage = 10;
  const skip = (page - 1) * itemsPerPage;

  const [employees, totalEmployees, payRates, departments] = await Promise.all([
    prisma.employee.findMany({
      orderBy: { lastName: "asc" },
      include: {
        user: {
          select: { email: true, role: true, departmentId: true },
        },
      },
      skip: skip,
      take: itemsPerPage,
    }),
    prisma.employee.count(),
    prisma.payRate.findMany({ orderBy: { name: 'asc' }}),
    prisma.department.findMany({ orderBy: { name: 'asc' }})
  ]);

  const hasNextPage = (page * itemsPerPage) < totalEmployees;
  const hasPrevPage = page > 1;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">
          Gestion des Employés
        </h1>
        <AddEmployeeButton />
      </div>

      <div className="bg-white dark:bg-dark-container rounded-lg shadow-md">
        <EmployeeList
          employees={employees}
          payRates={payRates}
          departments={departments}
        />
        <PaginationControls
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          totalItems={totalEmployees}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
}