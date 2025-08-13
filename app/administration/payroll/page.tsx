// app/administration/payroll/page.tsx
import prisma from "@/lib/prisma";
import { PayrollEmployeeList } from "./components/PayrollEmployeeList";
import { PaginationControls } from "../components/PaginationControls";

interface PayrollPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export const dynamic = 'force-dynamic';

export default async function PayrollPage({ searchParams }: PayrollPageProps) {
  const page = Number(searchParams["page"]) || 1;
  const itemsPerPage = Number(searchParams["per_page"]) || 10;
  const skip = (page - 1) * itemsPerPage;

  const [employees, totalEmployees] = await prisma.$transaction([
    prisma.employee.findMany({
      orderBy: {
        lastName: "asc",
      },
      include: {
        user: {
          select: {
            email: true,
            image: true,
          },
        },
      },
      skip: skip,
      take: itemsPerPage,
    }),
    prisma.employee.count(),
  ]);

  const hasNextPage = (page * itemsPerPage) < totalEmployees;
  const hasPrevPage = page > 1;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">
          Paie & Suivi RH
        </h1>
      </div>

      <div className="bg-white dark:bg-dark-container rounded-lg shadow-md">
        <PayrollEmployeeList employees={employees} />
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