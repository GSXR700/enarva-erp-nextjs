// app/administration/leads/components/LeadForm.tsx
"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadSchema, LeadFormValues } from "../validation";
import { Lead, LeadType, LeadCanal, User, Subcontractor } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import React from 'react';
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Helper to format date for input[type=date] which requires 'YYYY-MM-DD'
const formatDateForInput = (date: Date | null | undefined): string => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
};

interface LeadFormProps {
  initialData?: Lead | null;
  users: User[];
  subcontractors: Subcontractor[];
  onFormSubmit: () => void;
}

export const LeadForm: React.FC<LeadFormProps> = ({ initialData, users, subcontractors, onFormSubmit }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!initialData;

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    // Correctly map initialData to form values, handling nulls for optional fields
    defaultValues: initialData ? {
        nom: initialData.nom,
        telephone: initialData.telephone ?? "",
        email: initialData.email ?? "",
        canal: initialData.canal,
        type: initialData.type,
        source: initialData.source ?? "",
        quoteObject: initialData.quoteObject ?? "",
        commentaire: initialData.commentaire ?? "",
        assignedToId: initialData.assignedToId ?? undefined,
        subcontractorAsSourceId: initialData.subcontractorAsSourceId ?? undefined,
        date_intervention: formatDateForInput(initialData.date_intervention),
        date_cloture: formatDateForInput(initialData.date_cloture),
    } : {
        nom: "",
        telephone: "",
        email: "",
        canal: LeadCanal.MANUEL,
        type: LeadType.BtoC,
        source: "",
        quoteObject: "",
        commentaire: "",
        date_intervention: "",
        date_cloture: "",
    }
  });

  // Watch the "canal" field to conditionally show the subcontractor dropdown
  const watchedCanal = form.watch("canal");

  const onSubmit: SubmitHandler<LeadFormValues> = async (values) => {
    setIsLoading(true);
    try {
      const url = isEditMode ? `/api/leads/${initialData?.id}` : '/api/leads';
      const method = isEditMode ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Échec de la ${isEditMode ? 'mise à jour' : 'création'}.`);
      }

      toast.success(`Prospect ${isEditMode ? 'mis à jour' : 'créé avec succès'}.`);
      router.refresh();
      onFormSubmit();

    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Une erreur inconnue est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Nom du Contact *</label>
                <input id="nom" {...form.register("nom")} className="w-full p-2 border rounded-md bg-white dark:bg-dark-background" />
                {form.formState.errors.nom && <p className="text-red-500 text-xs mt-1">{form.formState.errors.nom.message}</p>}
            </div>
             <div>
                <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Téléphone</label>
                <input id="telephone" {...form.register("telephone")} className="w-full p-2 border rounded-md bg-white dark:bg-dark-background" />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Email</label>
                <input id="email" type="email" {...form.register("email")} className="w-full p-2 border rounded-md bg-white dark:bg-dark-background" />
                {form.formState.errors.email && <p className="text-red-500 text-xs mt-1">{form.formState.errors.email.message}</p>}
            </div>
            <div>
                <label htmlFor="assignedToId" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Assigné à</label>
                <select id="assignedToId" {...form.register("assignedToId")} className="w-full p-2 border rounded-md bg-white dark:bg-dark-background">
                    <option value="">Non assigné</option>
                    {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                </select>
            </div>
             <div>
                <label htmlFor="canal" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Canal d'acquisition</label>
                <select id="canal" {...form.register("canal")} className="w-full p-2 border rounded-md bg-white dark:bg-dark-background">
                    {Object.values(LeadCanal).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
             {watchedCanal === 'APPORTEUR_AFFAIRES' ? (
                <div>
                    <label htmlFor="subcontractorAsSourceId" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Apporteur d'Affaires</label>
                    <select id="subcontractorAsSourceId" {...form.register("subcontractorAsSourceId")} className="w-full p-2 border rounded-md bg-white dark:bg-dark-background">
                        <option value="">Sélectionner un partenaire</option>
                        {subcontractors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
             ) : (
                <div>
                    <label htmlFor="source" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Source (Détail)</label>
                    <input id="source" {...form.register("source")} placeholder="Ex: Campagne Facebook 'Promo Été'" className="w-full p-2 border rounded-md bg-white dark:bg-dark-background" />
                </div>
             )}
            <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Type de Lead</label>
                <select id="type" {...form.register("type")} className="w-full p-2 border rounded-md bg-white dark:bg-dark-background">
                    {Object.values(LeadType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
            <div className="md:col-span-2">
                <label htmlFor="quoteObject" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Objet du Devis *</label>
                <input id="quoteObject" {...form.register("quoteObject")} placeholder="Ex: Nettoyage de fin de chantier pour une villa à Targa" className="w-full p-2 border rounded-md bg-white dark:bg-dark-background" />
                {form.formState.errors.quoteObject && <p className="text-red-500 text-xs mt-1">{form.formState.errors.quoteObject.message}</p>}
            </div>
            <div>
                <label htmlFor="date_intervention" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Date d'Intervention Prévue</label>
                <input id="date_intervention" type="date" {...form.register("date_intervention")} className="w-full p-2 border rounded-md bg-white dark:bg-dark-background" />
            </div>
            <div>
                <label htmlFor="date_cloture" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Date de Clôture</label>
                <input id="date_cloture" type="date" {...form.register("date_cloture")} className="w-full p-2 border rounded-md bg-white dark:bg-dark-background" />
            </div>
            <div className="md:col-span-2">
                <label htmlFor="commentaire" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Commentaires</label>
                <textarea id="commentaire" {...form.register("commentaire")} rows={4} className="w-full p-2 border rounded-md bg-white dark:bg-dark-background" />
            </div>
        </div>

      <div className="flex justify-end items-center pt-4 space-x-3">
        <button type="button" onClick={onFormSubmit} className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200">Annuler</button>
        <button type="submit" disabled={isLoading} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-white hover:bg-primary/90 h-10 py-2 px-4">
          {isLoading ? <Loader2 className="animate-spin" /> : (isEditMode ? "Enregistrer" : "Créer Prospect")}
        </button>
      </div>
    </form>
  );
};