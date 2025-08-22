// app/administration/clients/new/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { ClientForm } from "../components/ClientForm";

export const metadata: Metadata = {
  title: 'Nouveau Client | Enarva Admin',
  description: 'Créer un nouveau client',
};

export default function NewClientPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">
          Créer un Nouveau Client
        </h1>
        <Link 
          href="/administration/clients"
          className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-dark-subtle dark:hover:text-dark-text transition"
        >
          ← Retour aux clients
        </Link>
      </div>
      
      <div className="bg-white dark:bg-dark-container rounded-lg shadow-md p-6">
        <ClientForm />
      </div>
    </div>
  );
}