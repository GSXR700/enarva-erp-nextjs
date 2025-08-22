// app/administration/leads/new/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { LeadForm } from "../components/LeadForm";

export const metadata: Metadata = {
  title: 'Nouveau Prospect | Enarva Admin',
  description: 'Créer un nouveau prospect',
};

export default async function NewLeadPage() {
  try {
    // Récupérer les utilisateurs et sous-traitants pour le formulaire
    const [users, subcontractors] = await Promise.all([
      prisma.user.findMany({
        where: { role: { in: ['ADMIN', 'MANAGER'] } },
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
      }),
      prisma.subcontractor.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
      })
    ]);

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">
            Créer un Nouveau Prospect
          </h1>
          <Link 
            href="/administration/leads"
            className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-dark-subtle dark:hover:text-dark-text transition"
          >
            ← Retour aux prospects
          </Link>
        </div>
        
        <div className="bg-white dark:bg-dark-container rounded-lg shadow-md p-6">
          <LeadForm users={users} subcontractors={subcontractors} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching data for new lead:', error);
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Erreur</h1>
        <p className="mt-2 text-gray-600 dark:text-dark-subtle">
          Une erreur est survenue lors du chargement des données.
        </p>
        <Link 
          href="/administration/leads"
          className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
        >
          Retour aux prospects
        </Link>
      </div>
    );
  }
}