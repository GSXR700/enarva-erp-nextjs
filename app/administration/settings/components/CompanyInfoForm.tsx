// app/administration/settings/components/CompanyInfoForm.tsx
"use client";

import { useState } from "react";
import type { CompanyInfo } from "@prisma/client";
import { saveCompanyInfo } from "../actions";
import { Loader2 } from "lucide-react";

export function CompanyInfoForm({ companyInfo }: { companyInfo: CompanyInfo }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const result = await saveCompanyInfo(formData);

    if (result.success) {
      setMessage(result.message || "Succès !");
      setTimeout(() => setMessage(""), 3000);
    } else {
      alert(result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white dark:bg-dark-container rounded-lg shadow-md">
      <form onSubmit={handleSubmit}>
        <div className="p-4 border-b dark:border-dark-border">
          <h3 className="font-semibold text-lg dark:text-dark-text">Informations de l'Entreprise</h3>
          <p className="text-sm text-gray-500 dark:text-dark-subtle">Ces informations apparaissent sur vos devis, factures et bons de livraison.</p>
        </div>
        {/* CORRECTION: La grille est maintenant plus structurée avec des conteneurs pour chaque champ */}
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="companyName" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Nom de l'entreprise</label>
            <input id="companyName" name="companyName" defaultValue={companyInfo.companyName || ''} className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border text-gray-800 dark:text-dark-text" required />
          </div>
          <div>
            <label htmlFor="address" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Adresse</label>
            <input id="address" name="address" defaultValue={companyInfo.address || ''} className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border text-gray-800 dark:text-dark-text" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Email</label>
              <input id="email" type="email" name="email" defaultValue={companyInfo.email || ''} className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border text-gray-800 dark:text-dark-text" />
            </div>
            <div>
              <label htmlFor="phone" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Téléphone</label>
              <input id="phone" name="phone" defaultValue={companyInfo.phone || ''} className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border text-gray-800 dark:text-dark-text" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="website" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Site Web</label>
              <input id="website" name="website" defaultValue={companyInfo.website || ''} className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border text-gray-800 dark:text-dark-text" />
            </div>
            <div>
              <label htmlFor="rc" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Registre de commerce</label>
              <input id="rc" name="rc" defaultValue={companyInfo.rc || ''} className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border text-gray-800 dark:text-dark-text" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="if" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Identifiant fiscal</label>
              <input id="if" name="if" defaultValue={companyInfo.if || ''} className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border text-gray-800 dark:text-dark-text" />
            </div>
            <div>
              <label htmlFor="ice" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">ICE</label>
              <input id="ice" name="ice" defaultValue={companyInfo.ice || ''} className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border text-gray-800 dark:text-dark-text" />
            </div>
          </div>

          <div>
            <label htmlFor="rib" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">RIB</label>
            <input id="rib" name="rib" defaultValue={companyInfo.rib || ''} className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border text-gray-800 dark:text-dark-text" />
          </div>
        </div>
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-b-lg dark:bg-dark-surface">
            <p className="text-sm text-green-600 transition-opacity duration-300 dark:text-green-400" style={{opacity: message ? 1 : 0}}>{message}</p>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 font-bold text-white bg-primary rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center">
              {isSubmitting && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
              Sauvegarder les modifications
            </button>
        </div>
      </form>
    </div>
  );
}