// app/administration/invoices/page.tsx

import prisma from "@/lib/prisma";
import { InvoiceList } from "./components/InvoiceList";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PaginationControls } from "../components/PaginationControls";

const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;

interface InvoicesPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const page = Number(searchParams["page"]) || 1;
  const itemsPerPage = Number(searchParams["per_page"]) || 10;
  const skip = (page - 1) * itemsPerPage;

  // Utilisation d'une transaction pour récupérer les données en parallèle
  const [invoices, totalInvoices, companyInfo] = await prisma.$transaction([
    prisma.invoice.findMany({
      orderBy: { date: "desc" },
      include: {
        client: {
          select: {
            nom: true
          }
        }
      },
      skip: skip,
      take: itemsPerPage,
    }),
    prisma.invoice.count(),
    prisma.companyInfo.findFirst(),
  ]);

  if (!companyInfo) {
    notFound();
  }

  const hasNextPage = (page * itemsPerPage) < totalInvoices;
  const hasPrevPage = page > 1;

  // On s'assure que les données sont bien sérialisables
  const serializableInvoices = JSON.parse(JSON.stringify(invoices));

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">
          Gestion des Factures
        </h1>
        {/* Le bouton pour créer une facture sera ajouté plus tard */}
      </div>

      <div className="bg-white dark:bg-dark-container rounded-lg shadow-md">
        <InvoiceList invoices={serializableInvoices} />
        <PaginationControls
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          totalItems={totalInvoices}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
}