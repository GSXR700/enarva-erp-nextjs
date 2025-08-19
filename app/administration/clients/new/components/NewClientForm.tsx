"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { ClientType, ClientStatus, PaymentMode } from "@prisma/client";
import { clientSchema, ClientFormValues } from "@/lib/validations";
import { saveClient } from "../../actions";
import { toast } from "sonner";

export function NewClientForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      nom: "",
      email: "",
      telephone: "",
      adresse: "",
      secteur: "",
      contact_secondaire: "",
      type: ClientType.ENTREPRISE,
      statut: ClientStatus.ACTIF,
      mode_paiement_prefere: PaymentMode.VIREMENT,
      contrat_en_cours: false,
    },
  });

  const onSubmit = async (values: ClientFormValues) => {
    setIsSubmitting(true);
    
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value === null ? "" : String(value));
      }
    });

    const result = await saveClient(formData);

    if (result.success) {
      toast.success("Client créé avec succès");
      router.push('/administration/clients');
    } else {
      toast.error(result.error || "Erreur lors de la création");
    }
    setIsSubmitting(false);
  };

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
            Nouveau Client
          </h1>
          <p className="text-sm text-gray-500 dark:text-dark-subtle hidden md:block">
            Informations du client
          </p>
        </div>
        
        <div className="w-10"></div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-dark-container rounded-lg shadow-sm border border-gray-200 dark:border-dark-border">
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom / Raison sociale *
              </label>
              <input
                {...form.register("nom")}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-background dark:border-dark-border dark:text-white"
                placeholder="Ex: Société ABC"
              />
              {form.formState.errors.nom && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.nom.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type de client
              </label>
              <select
                {...form.register("type")}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-background dark:border-dark-border dark:text-white"
              >
                <option value={ClientType.PARTICULIER}>Particulier</option>
                <option value={ClientType.ENTREPRISE}>Entreprise</option>
                <option value={ClientType.INSTITUTION}>Institution</option>
              </select>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                {...form.register("email")}
                type="email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-background dark:border-dark-border dark:text-white"
                placeholder="contact@entreprise.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Téléphone
              </label>
              <input
                {...form.register("telephone")}
                type="tel"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-background dark:border-dark-border dark:text-white"
                placeholder="+212 6 XX XX XX XX"
              />
            </div>
          </div>

          {/* Address and Sector */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Adresse
              </label>
              <textarea
                {...form.register("adresse")}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-background dark:border-dark-border dark:text-white"
                placeholder="Adresse complète"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Secteur d'activité
                </label>
                <input
                  {...form.register("secteur")}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-background dark:border-dark-border dark:text-white"
                  placeholder="Ex: Industrie, Commerce, Services"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mode de paiement préféré
                </label>
                <select
                  {...form.register("mode_paiement_prefere")}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-background dark:border-dark-border dark:text-white"
                >
                  <option value={PaymentMode.VIREMENT}>Virement</option>
                  <option value={PaymentMode.CHEQUE}>Chèque</option>
                  <option value={PaymentMode.CASH}>Espèces</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-dark-border">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 sm:flex-none px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors dark:border-dark-border dark:text-gray-300 dark:hover:bg-dark-highlight-bg"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Création...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Créer le client</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}