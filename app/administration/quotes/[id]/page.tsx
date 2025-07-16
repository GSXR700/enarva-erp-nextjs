// app/administration/quotes/[id]/page.tsx
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { QuoteView } from "./components/QuoteView";

export default async function QuoteDetailsPage({ params }: { params: { id: string } }) {
  // On récupère les deux informations en même temps
  const [quote, companyInfo] = await Promise.all([
    prisma.quote.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        prestation: true 
      },
    }),
    prisma.companyInfo.findFirst(),
  ]);

  // Si l'un ou l'autre n'est pas trouvé, on affiche une page 404
  if (!quote || !companyInfo) {
    notFound();
  }

  // On passe les deux objets au composant d'affichage
  return <QuoteView quote={quote} companyInfo={companyInfo} />;
}