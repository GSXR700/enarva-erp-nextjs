// enarva-nextjs-app/app/administration/subcontractors/page.tsx
import prisma from "@/lib/prisma";
import { PaginationControls } from "../components/PaginationControls";
import { SubcontractorList } from "./components/SubcontractorList";
import { AddSubcontractorButton } from "./components/AddSubcontractorButton";

interface SubcontractorsPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function SubcontractorsPage({ searchParams }: SubcontractorsPageProps) {
  const page = Number(searchParams["page"]) || 1;
  const itemsPerPage = 10;
  const skip = (page - 1) * itemsPerPage;

  const [subcontractors, totalSubcontractors] = await prisma.$transaction([
    prisma.subcontractor.findMany({
      orderBy: { name: "asc" },
      skip,
      take: itemsPerPage,
    }),
    prisma.subcontractor.count(),
  ]);

  const hasNextPage = (page * itemsPerPage) < totalSubcontractors;
  const hasPrevPage = page > 1;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">
          Gestion des Sous-traitants
        </h1>
        <AddSubcontractorButton />
      </div>

      <div className="bg-white dark:bg-dark-container rounded-lg shadow-md">
        <SubcontractorList subcontractors={subcontractors} />
        <PaginationControls
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          totalItems={totalSubcontractors}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
}