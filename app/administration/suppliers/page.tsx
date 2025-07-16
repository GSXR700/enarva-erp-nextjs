// enarva-nextjs-dashboard-app/app/administration/suppliers/page.tsx
import prisma from "@/lib/prisma";
import { SupplierList } from "./components/SupplierList";

export const dynamic = 'force-dynamic';

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">
          Gestion des Fournisseurs
        </h1>
        {/* Le bouton d'ajout sera dans le composant client */}
      </div>

      <div className="bg-white dark:bg-dark-container rounded-lg shadow-md">
        <SupplierList suppliers={suppliers} />
      </div>
    </div>
  );
}