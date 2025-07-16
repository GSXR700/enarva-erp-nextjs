import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { QuoteForm } from "../../components/QuoteForm";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: 'Modifier un devis | Enarva Admin',
  description: 'Modifier les détails d\'un devis existant',
};

export default async function EditQuotePage({ params }: { params: { id: string } }) {
  try {
    const [quote, clients, products, services] = await Promise.all([
      prisma.quote.findUnique({ 
        where: { id: params.id },
        include: { prestation: true, client: true }
      }),
      prisma.client.findMany({ orderBy: { nom: "asc" } }),
      prisma.product.findMany({ orderBy: { designation: "asc" } }),
      prisma.service.findMany({ orderBy: { name: "asc" } }),
    ]);

    if (!quote) {
      notFound();
    }
    
    if (quote.status === 'ACCEPTED' || quote.status === 'REFUSED') {
      return (
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600">Accès Refusé</h1>
          <p className="mt-2 text-gray-600 dark:text-dark-subtle">
            Ce devis ne peut plus être modifié car il a été {quote.status === 'ACCEPTED' ? 'accepté' : 'refusé'}.
          </p>
          <Link 
            href="/administration/quotes"
            className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
          >
            Retour aux devis
          </Link>
        </div>
      );
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text mb-8">
          Modifier le Devis <span className="text-primary">{quote.quoteNumber}</span>
        </h1>
        
        <QuoteForm 
          clients={clients} 
          products={products} 
          services={services} 
          quote={quote} 
        />
      </div>
    );
  } catch (error) {
    console.error('Error fetching quote data:', error);
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Erreur</h1>
        <p className="mt-2 text-gray-600 dark:text-dark-subtle">
          Une erreur est survenue lors du chargement du devis. Veuillez réessayer plus tard.
        </p>
        <Link 
          href="/administration/quotes"
          className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
        >
          Retour aux devis
        </Link>
      </div>
    );
  }
}