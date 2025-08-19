"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X } from "lucide-react";
import { LeadForm } from "../../components/LeadForm";
import type { User, Subcontractor } from "@prisma/client";

interface NewLeadFormProps {
    users: User[];
    subcontractors: Subcontractor[];
}

export function NewLeadForm({ users, subcontractors }: NewLeadFormProps) {
  const router = useRouter();

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Mobile-first header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors p-2 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          <span className="hidden sm:inline">Retour</span>
        </button>
        
        <div className="text-center flex-1 mx-4">
          <h1 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
            Nouveau Prospect
          </h1>
          <p className="text-sm text-gray-500 dark:text-dark-subtle hidden md:block">
            Remplissez les informations ci-dessous
          </p>
        </div>
        
        <div className="w-10"></div> {/* Spacer pour centrer le titre */}
      </div>

      {/* Form container optimized for mobile */}
      <div className="bg-white dark:bg-dark-container rounded-lg shadow-sm border border-gray-200 dark:border-dark-border">
        <div className="p-4 md:p-6">
          <LeadForm
            users={users}
            subcontractors={subcontractors}
            onFormSubmit={() => router.push('/administration/leads')}
          />
        </div>
      </div>
    </div>
  );
}