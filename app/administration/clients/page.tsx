// enarva-nextjs-app/app/administration/clients/page.tsx
import prisma from "@/lib/prisma";
import { ClientPageClient } from "./components/ClientPageClient";

interface ClientsPageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const page = Number(searchParams["page"]) || 1;
  const itemsPerPage = Number(searchParams["per_page"]) || 10;
  const skip = (page - 1) * itemsPerPage;

  const [clients, totalClients] = await prisma.$transaction([
    prisma.client.findMany({
      orderBy: {
        // CORRECTION: Use the new field name 'nom' for sorting
        nom: "asc",
      },
      skip: skip,
      take: itemsPerPage,
    }),
    prisma.client.count(),
  ]);

  return (
    <ClientPageClient
      initialClients={clients}
      totalClients={totalClients}
      itemsPerPage={itemsPerPage}
    />
  );
}