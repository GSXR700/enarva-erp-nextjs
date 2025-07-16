// enarva-nextjs-app/app/administration/delivery-notes/page.tsx
import prisma from "@/lib/prisma";
import { DeliveryNoteList } from "./components/DeliveryNoteList";
import { notFound } from "next/navigation";
import { PaginationControls } from "../components/PaginationControls";

interface DeliveryNotesPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function DeliveryNotesPage({ searchParams }: DeliveryNotesPageProps) {
  const page = Number(searchParams["page"]) || 1;
  const itemsPerPage = Number(searchParams["per_page"]) || 10;
  const skip = (page - 1) * itemsPerPage;

  const [deliveryNotes, totalDeliveryNotes, companyInfo] = await prisma.$transaction([
    prisma.deliveryNote.findMany({
      orderBy: {
        date: "desc",
      },
      include: {
        order: {
          include: {
            client: true,
          },
        },
      },
      skip: skip,
      take: itemsPerPage,
    }),
    prisma.deliveryNote.count(),
    prisma.companyInfo.findFirst(),
  ]);

  if (!companyInfo) {
    notFound();
  }

  const hasNextPage = (page * itemsPerPage) < totalDeliveryNotes;
  const hasPrevPage = page > 1;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">
          Gestion des Bons de Livraison
        </h1>
      </div>

      <div className="bg-white dark:bg-dark-container rounded-lg shadow-md">
        <DeliveryNoteList deliveryNotes={deliveryNotes} companyInfo={companyInfo} />
        <PaginationControls
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          totalItems={totalDeliveryNotes}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
}