// app/administration/leads/new/page.tsx
"use client"; // Ce composant a besoin d'interactivité pour la redirection

import { useRouter } from "next/navigation";
import { LeadForm } from "../components/LeadForm";
import { ChevronLeft } from "lucide-react";

const NewLeadPage = () => {
  const router = useRouter();

  return (
    <div className="space-y-6">
        <div>
             <button onClick={() => router.back()} className="flex items-center text-sm text-gray-500 dark:text-dark-subtle mb-4 hover:underline">
                <ChevronLeft className="h-4 w-4 mr-1"/>
                Retour
            </button>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Créer un nouveau prospect</h1>
            <p className="text-sm text-gray-500 dark:text-dark-subtle">Remplissez les informations ci-dessous.</p>
        </div>
        <div className="p-4 md:p-6 bg-white dark:bg-dark-surface rounded-lg shadow-sm">
            <LeadForm
                // On ne passe pas de initialData pour être en mode "création"
                onFormSubmit={() => {
                    // Après la création, on redirige vers la liste des leads
                    router.push('/administration/leads');
                }} 
            />
        </div>
    </div>
  );
}

export default NewLeadPage;