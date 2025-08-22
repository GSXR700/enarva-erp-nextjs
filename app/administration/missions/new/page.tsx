// app/administration/missions/new/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { MissionForm } from "../components/MissionForm";

export const metadata: Metadata = {
  title: 'Nouvelle Mission | Enarva Admin',
  description: 'Créer une nouvelle mission',
};

export default async function NewMissionPage() {
  try {
    // Récupérer les données nécessaires pour le formulaire
    const [orders, employees] = await Promise.all([
      prisma.order.findMany({
        where: { 
          missions: { none: {} } // Seulement les commandes sans mission
        },
        include: {
          client: { select: { nom: true } },
          quote: { select: { object: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.employee.findMany({
        include: {
          user: { select: { name: true } }
        },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }]
      })
    ]);

    if (!orders.length) {
      return (
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-amber-600">Attention</h1>
          <p className="mt-2 text-gray-600 dark:text-dark-subtle">
            Aucune commande disponible pour créer une mission. Vous devez d'abord avoir des devis acceptés.
          </p>
          <Link 
            href="/administration/quotes"
            className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
          >
            Voir les devis
          </Link>
        </div>
      );
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">
            Créer une Nouvelle Mission
          </h1>
          <Link 
            href="/administration/missions"
            className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-dark-subtle dark:hover:text-dark-text transition"
          >
            ← Retour aux missions
          </Link>
        </div>
        
        <div className="bg-white dark:bg-dark-container rounded-lg shadow-md p-6">
          <MissionForm 
            orders={orders} 
            employees={employees} 
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching data for new mission:', error);
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Erreur</h1>
        <p className="mt-2 text-gray-600 dark:text-dark-subtle">
          Une erreur est survenue lors du chargement des données.
        </p>
        <Link 
          href="/administration/missions"
          className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
        >
          Retour aux missions
        </Link>
      </div>
    );
  }
}