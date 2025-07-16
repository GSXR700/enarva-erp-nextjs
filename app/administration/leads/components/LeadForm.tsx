// app/administration/leads/components/LeadForm.tsx
"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadSchema, LeadFormValues } from "../validation";
import { Lead, LeadType, LeadCanal, LeadStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import React from 'react';

interface LeadFormProps {
  initialData?: Lead | null;
  onFormSubmit: () => void; // Gardé pour la modale de création
}

export const LeadForm: React.FC<LeadFormProps> = ({ initialData, onFormSubmit }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!initialData;

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      contactName: "",
      companyName: "",
      email: "",
      phone: "",
      canal: LeadCanal.MANUEL,
      type: LeadType.BtoC,
      source: "",
      notes: ""
    } as LeadFormValues
  });

  useEffect(() => {
    if (isEditMode && initialData) {
      // Map database fields to form fields
      const formData: LeadFormValues = {
        contactName: initialData.nom,
        companyName: "", // Not in database schema yet
        email: initialData.email ?? "",
        phone: initialData.telephone ?? "",
        canal: initialData.canal,
        type: initialData.type,
        source: initialData.source ?? "",
        notes: initialData.commentaire ?? ""
      };
      form.reset(formData);
    } else {
      form.reset({
        contactName: "",
        companyName: "",
        email: "",
        phone: "",
        canal: LeadCanal.MANUEL,
        type: LeadType.BtoC,
        source: "",
        notes: "",
      });
    }
  }, [initialData, form, isEditMode]);

  const onSubmit: SubmitHandler<LeadFormValues> = async (values) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = isEditMode ? `/api/leads/${initialData?.id}` : '/api/leads';
      const method = isEditMode ? 'PATCH' : 'POST';

      // Map form fields back to database fields
      const dbValues = {
        nom: values.contactName,
        telephone: values.phone,
        email: values.email,
        canal: values.canal,
        type: values.type,
        source: values.source,
        commentaire: values.notes
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbValues),
      });

      if (!response.ok) {
        throw new Error(`Échec de la ${isEditMode ? 'mise à jour' : 'création'}.`);
      }

      alert(`Prospect ${isEditMode ? 'mis à jour' : 'créé'}.`);

      if (isEditMode) {
        router.push(`/administration/leads/${initialData?.id}`); // Redirige vers la page de détail
      } else {
        onFormSubmit(); // Ferme la modale de création
      }
      router.refresh();

    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if(isEditMode) {
        router.back();
    } else {
        onFormSubmit();
    }
  }

  const buttonText = isEditMode ? "Enregistrer les modifications" : "Créer le Prospect";
  const loadingText = isEditMode ? "Enregistrement..." : "Création...";

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit((data) => onSubmit(data as LeadFormValues))}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Nom du Contact *</label>
                <input id="contactName" {...form.register("contactName")} className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400" />
                {form.formState.errors.contactName && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{form.formState.errors.contactName.message}</p>}
            </div>
             <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Nom de l'entreprise</label>
                <input id="companyName" {...form.register("companyName")} className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400" />
                {form.formState.errors.companyName && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{form.formState.errors.companyName.message}</p>}
            </div>
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Téléphone</label>
                <input id="phone" {...form.register("phone")} className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400" />
                {form.formState.errors.phone && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{form.formState.errors.phone.message}</p>}
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Email</label>
                <input id="email" type="email" {...form.register("email")} className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400" />
                {form.formState.errors.email && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{form.formState.errors.email.message}</p>}
            </div>
            <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Type</label>
                <select id="type" {...form.register("type")} className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400">
                    {Object.values(LeadType).map(type => <option key={type} value={type} className="dark:bg-gray-800">{type}</option>)}
                </select>
                {form.formState.errors.type && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{form.formState.errors.type.message}</p>}
            </div>
            <div>
                <label htmlFor="canal" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Canal</label>
                <select id="canal" {...form.register("canal")} className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400">
                    {Object.values(LeadCanal).map(canal => <option key={canal} value={canal} className="dark:bg-gray-800">{canal}</option>)}
                </select>
                {form.formState.errors.canal && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{form.formState.errors.canal.message}</p>}
            </div>
            <div>
                <label htmlFor="source" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Source (Campagne, etc.)</label>
                <input id="source" {...form.register("source")} className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400" />
                {form.formState.errors.source && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{form.formState.errors.source.message}</p>}
            </div>
            <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Notes</label>
                <textarea id="notes" {...form.register("notes")} rows={4} className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400" />
                {form.formState.errors.notes && <p className="text-red-500 text-xs mt-1">{form.formState.errors.notes.message}</p>}
            </div>
        </div>

      {error && <p className="text-red-600 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded-md border border-red-200 dark:border-red-800">{error}</p>}

      <div className="flex justify-end items-center pt-4 space-x-3">
        <button 
          type="button" 
          onClick={handleCancel} 
          className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 transition-colors"
        >
          Annuler
        </button>
        <button 
          type="submit" 
          disabled={isLoading} 
          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 h-10 py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? loadingText : buttonText}
        </button>
      </div>
    </form>
  );
};