// enarva-nextjs-dashboard-app/app/administration/expenses/page.tsx
import prisma from "@/lib/prisma";
import { ExpensesAndSuppliersClient } from "./components/ExpensesAndSuppliersClient";

export const dynamic = 'force-dynamic';

export default async function ExpensesPage() {
  // On charge les deux listes en parallèle
  const [suppliers, expenses] = await Promise.all([
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
    prisma.expense.findMany({
      orderBy: { date: "desc" },
      include: { supplier: true } // On inclut le fournisseur lié
    }),
  ]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">
          Gestion des Achats
        </h1>
      </div>
      {/* On passe les données au nouveau composant qui gère les onglets */}
      <ExpensesAndSuppliersClient suppliers={suppliers} expenses={expenses} />
    </div>
  );
}