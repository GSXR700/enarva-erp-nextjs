import prisma from "@/lib/prisma";
import { PaginationControls } from "../components/PaginationControls";
import { EquipmentList } from "./components/EquipmentList";
import { AddEquipmentButton } from "./components/AddEquipmentButton";

interface EquipmentsPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function EquipmentsPage({ searchParams }: EquipmentsPageProps) {
  const page = Number(searchParams["page"]) || 1;
  const itemsPerPage = 10;
  const skip = (page - 1) * itemsPerPage;

  const [equipments, totalEquipments] = await prisma.$transaction([
    prisma.equipment.findMany({
      orderBy: { name: "asc" },
      skip,
      take: itemsPerPage,
    }),
    prisma.equipment.count(),
  ]);

  const hasNextPage = (page * itemsPerPage) < totalEquipments;
  const hasPrevPage = page > 1;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">
          Gestion du Matériel & Équipements
        </h1>
        <AddEquipmentButton />
      </div>

      <div className="bg-white dark:bg-dark-container rounded-lg shadow-md">
        <EquipmentList equipments={equipments} />
        <PaginationControls
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          totalItems={totalEquipments}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
}