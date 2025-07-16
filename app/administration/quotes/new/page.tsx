import prisma from "@/lib/prisma";
import { QuoteForm } from "../components/QuoteForm";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: 'Nouveau Devis | Enarva Admin',
  description: 'Créer un nouveau devis',
};

export default async function NewQuotePage() {
  try {
    const [clients, products, services] = await Promise.all([
      prisma.client.findMany({ orderBy: { nom: "asc" } }),
      prisma.product.findMany({ orderBy: { designation: "asc" } }),
      prisma.service.findMany({ orderBy: { name: "asc" } }),
    ]);

    if (!clients.length) {
      return (
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-amber-600">Attention</h1>
          <p className="mt-2 text-gray-600 dark:text-dark-subtle">
            Vous devez d'abord créer au moins un client avant de pouvoir créer un devis.
          </p>
          <Link 
            href="/administration/clients/new"
            className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
          >
            Créer un client
          </Link>
        </div>
      );
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">
            Créer un Nouveau Devis
          </h1>
          <Link 
            href="/administration/quotes"
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
          >
            Retour aux devis
          </Link>
        </div>
        
        <QuoteForm 
          clients={clients} 
          products={products} 
          services={services} 
        />
      </div>
    );
  } catch (error) {
    console.error('Error fetching data for new quote:', error);
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Erreur</h1>
        <p className="mt-2 text-gray-600 dark:text-dark-subtle">
          Une erreur est survenue lors du chargement des données. Veuillez réessayer plus tard.
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