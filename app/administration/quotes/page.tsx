// enarva-nextjs-app/app/administration/quotes/page.tsx
import prisma from "@/lib/prisma";
import { QuoteList } from "./components/QuoteList";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PaginationControls } from "../components/PaginationControls";

const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;

interface QuotesPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function QuotesPage({ searchParams }: QuotesPageProps) {
  const page = Number(searchParams["page"]) || 1;
  const itemsPerPage = Number(searchParams["per_page"]) || 10;
  const skip = (page - 1) * itemsPerPage;

  // --- CORRECTION : Nouvelle stratégie de récupération des données en 2 étapes ---

  // 1. Récupérer les devis et les informations générales en parallèle
  const [quotesData, totalQuotes, companyInfo] = await prisma.$transaction([
    prisma.quote.findMany({
      orderBy: { date: "desc" },
      skip: skip,
      take: itemsPerPage,
    }),
    prisma.quote.count(),
    prisma.companyInfo.findFirst(),
  ]);

  if (!companyInfo) {
    notFound();
  }

  // 2. Récupérer les clients associés aux devis trouvés
  const clientIds = quotesData
    .map((quote) => quote.clientId)
    .filter((id): id is string => id !== null); // Garde uniquement les IDs valides
  
  const clients = await prisma.client.findMany({
    where: {
      id: { in: [...new Set(clientIds)] }, // Utilise un Set pour éviter les doublons
    },
  });

  // 3. Créer une map pour une recherche rapide des clients par leur ID
  const clientMap = new Map(clients.map((client) => [client.id, client]));

  // 4. Assembler les données : chaque devis avec son client (ou null si non trouvé)
  const quotesWithClients = quotesData.map((quote) => ({
    ...quote,
    client: clientMap.get(quote.clientId) || null,
  }));
  
  const hasNextPage = (page * itemsPerPage) < totalQuotes;
  const hasPrevPage = page > 1;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">
          Gestion des Devis
        </h1>
        <Link 
          href="/administration/quotes/new"
          className="bg-blue-800 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
        >
          <PlusIcon />
          Devis
        </Link>
      </div>

      <div className="bg-white dark:bg-dark-container rounded-lg shadow-md">
        {/* On passe les données assemblées au composant client */}
        <QuoteList quotes={quotesWithClients} companyInfo={companyInfo} />
        <PaginationControls
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          totalItems={totalQuotes}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
}