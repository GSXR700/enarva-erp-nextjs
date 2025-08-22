// app/administration/equipment/new/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { EquipmentForm } from "../components/EquipmentForm";

export const metadata: Metadata = {
  title: 'Nouvel Équipement | Enarva Admin',
  description: 'Créer un nouvel équipement',
};

export default function NewEquipmentPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">
          Créer un Nouvel Équipement
        </h1>
        <Link 
          href="/administration/equipments"
          className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-dark-subtle dark:hover:text-dark-text transition"
        >
          ← Retour aux équipements
        </Link>
      </div>
      
      <div className="bg-white dark:bg-dark-container rounded-lg shadow-md p-6">
        <EquipmentForm />
      </div>
    </div>
  );
}