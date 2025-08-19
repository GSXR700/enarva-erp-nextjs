"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Wrench, Calendar } from "lucide-react";
import { toast } from "sonner";

export function NewEquipmentForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(event.currentTarget);
    
    try {
      const response = await fetch('/api/equipment', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast.success("Équipement créé avec succès");
        router.push('/administration/equipment');
      } else {
        toast.error("Erreur lors de la création");
      }
    } catch (error) {
      toast.error("Erreur réseau");
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
            Nouvel Équipement
          </h1>
          <p className="text-sm text-gray-500 dark:text-dark-subtle hidden md:block">
            Ajouter un équipement au parc matériel
          </p>
        </div>
        
        <div className="w-10"></div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-dark-container rounded-lg shadow-sm border border-gray-200 dark:border-dark-border">
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6">
          
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 mb-4">
            <Wrench className="h-5 w-5" />
            <span className="font-medium">Informations équipement</span>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom de l'équipement *
              </label>
              <input
                name="name"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-background dark:border-dark-border dark:text-white"
                placeholder="Ex: Monobrosse Numatic NuSpeed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type *
              </label>
              <select
                name="type"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-background dark:border-dark-border dark:text-white"
              >
                <option value="">Sélectionner un type</option>
                <option value="nettoyage_sols">Nettoyage sols</option>
                <option value="aspirateur">Aspirateur</option>
                <option value="nettoyage_vitres">Nettoyage vitres</option>
                <option value="haute_pression">Haute pression</option>
                <option value="vehicule">Véhicule</option>
                <option value="outillage">Outillage</option>
                <option value="electromenager">Électroménager</option>
                <option value="autre">Autre</option>
              </select>
            </div>
          </div>

          {/* Serial and Purchase */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Numéro de série
              </label>
              <input
                name="serialNumber"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-background dark:border-dark-border dark:text-white"
                placeholder="Ex: NS2024001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date d'achat
              </label>
              <input
                name="purchaseDate"
                type="date"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-background dark:border-dark-border dark:text-white"
              />
            </div>
          </div>

          {/* Financial Information */}
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h3 className="font-medium text-gray-800 dark:text-white mb-3">
              Informations financières
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prix d'achat (MAD)
                </label>
                <input
                  name="purchasePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-background dark:border-dark-border dark:text-white"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fournisseur
                </label>
                <input
                  name="supplier"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-background dark:border-dark-border dark:text-white"
                  placeholder="Nom du fournisseur"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Durée de garantie (mois)
                </label>
                <input
                  name="warrantyMonths"
                  type="number"
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-background dark:border-dark-border dark:text-white"
                  placeholder="12"
                />
              </div>
            </div>
          </div>

          {/* Status and Notes */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                État
              </label>
              <select
                name="status"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-background dark:border-dark-border dark:text-white"
              >
                <option value="IN_SERVICE">En service</option>
                <option value="IN_MAINTENANCE">En maintenance</option>
                <option value="OUT_OF_SERVICE">Hors service</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes / Description
              </label>
              <textarea
                name="notes"
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-background dark:border-dark-border dark:text-white"
                placeholder="Caractéristiques techniques, localisation habituelle, notes d'utilisation..."
              />
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
                  <span>Créer l'équipement</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}