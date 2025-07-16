"use client";

import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Client, ClientType, ClientStatus, PaymentMode } from "@prisma/client";
import { clientSchema, ClientFormValues } from "../../../../lib/validations";
import { saveClient } from "../actions";
import { useRouter } from "next/navigation";

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

export function ClientFormModal({ isOpen, onClose, client }: ClientFormModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!client;

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
      id: undefined,
    },
  });

  useEffect(() => {
    if (isOpen && client) {
      const clientFormValues: ClientFormValues = {
        nom: client.nom ?? "",
        email: client.email ?? "",
        telephone: client.telephone ?? "",
        adresse: client.adresse ?? "",
        secteur: client.secteur ?? "",
        contact_secondaire: client.contact_secondaire ?? "",
        type: client.type ?? ClientType.ENTREPRISE,
        statut: client.statut ?? ClientStatus.ACTIF,
        mode_paiement_prefere: client.mode_paiement_prefere ?? PaymentMode.VIREMENT,
        contrat_en_cours: client.contrat_en_cours ?? false,
        id: client.id,
      };
      form.reset(clientFormValues);
    } else if (!isOpen) {
      form.reset({
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
        id: undefined,
      });
    }
  }, [isOpen, client, form]);

  const onSubmit: SubmitHandler<ClientFormValues> = async (values) => {
    setIsSubmitting(true);

    // Convert object to FormData for saveClient
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      // Only append if value is not undefined
      if (value !== undefined) {
        formData.append(key, value === null ? "" : String(value));
      }
    });

    const result = await saveClient(formData);

    if (result.success) {
      alert(`Client ${isEditMode ? "mis à jour" : "créé"} avec succès!`);
      router.refresh();
      onClose();
    } else {
      alert(result.error);
    }
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl m-4 dark:bg-dark-container">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="p-4 border-b flex justify-between items-center dark:border-dark-border">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-dark-text">
              {isEditMode ? "Modifier le client" : "Ajouter un client"}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-3xl dark:hover:text-white"
            >
              &times;
            </button>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nom du Client *
                </label>
                <input
                  {...form.register("nom")}
                  className="w-full p-2 border rounded"
                />
                {form.formState.errors.nom && (
                  <p className="text-red-500 text-xs mt-1">
                    {form.formState.errors.nom.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Type de Client
                </label>
                <select
                  {...form.register("type")}
                  className="w-full p-2 border rounded"
                >
                  {Object.values(ClientType).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  {...form.register("email")}
                  className="w-full p-2 border rounded"
                />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Téléphone
                </label>
                <input
                  {...form.register("telephone")}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Secteur d'activité
                </label>
                <input
                  {...form.register("secteur")}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Contact Secondaire
                </label>
                <input
                  {...form.register("contact_secondaire")}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Adresse
                </label>
                <textarea
                  {...form.register("adresse")}
                  rows={3}
                  className="w-full p-2 border rounded"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Statut du Client
                </label>
                <select
                  {...form.register("statut")}
                  className="w-full p-2 border rounded"
                >
                  {Object.values(ClientStatus).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Mode de Paiement Préféré
                </label>
                <select
                  {...form.register("mode_paiement_prefere")}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Non défini</option>
                  {Object.values(PaymentMode).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-end p-4 bg-gray-50 rounded-b-lg dark:bg-dark-surface">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded mr-2 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {isSubmitting ? "Sauvegarde..." : "Sauvegarder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}