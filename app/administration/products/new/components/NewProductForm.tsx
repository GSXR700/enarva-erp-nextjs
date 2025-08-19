"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Package } from "lucide-react";
import { toast } from "sonner";

export function NewProductForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(event.currentTarget);
    
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast.success("Produit créé avec succès");
        router.push('/administration/products');
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
            Nouveau Produit
          </h1>
          <p className="text-sm text-gray-500 dark:text-dark-subtle hidden md:block">
            Ajouter un produit au catalogue
          </p>
        </div>
        
        <div className="w-10"></div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-dark-container rounded-lg shadow-sm border border-gray-200 dark:border-dark-border">
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6">
          
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 mb-4">
            <Package className="h-5 w-5" />
            <span className="font-medium">Informations produit</span>
          </div>

          {/* Product Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Désignation *
              </label>
              <input
                name="designation"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-background dark:border-dark-border dark:text-white"
                placeholder="Ex: Détergent multi-surfaces 5L"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prix unitaire HT (MAD) *
              </label>
              <input
                name="pu_ht"
                type="number"
                step="0.01"
                min="0"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-background dark:border-dark-border dark:text-white"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-background dark:border-dark-border dark:text-white"
                placeholder="Description détaillée du produit, utilisation, caractéristiques..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Catégorie
                </label>
                <select
                  name="category"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-background dark:border-dark-border dark:text-white"
                >
                  <option value="">Sélectionner une catégorie</option>
                  <option value="nettoyage">Produits de nettoyage</option>
                  <option value="materiel">Matériel</option>
                  <option value="equipement">Équipement</option>
                  <option value="consommable">Consommables</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Unité
                </label>
                <select
                  name="unit"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-background dark:border-dark-border dark:text-white"
                >
                  <option value="unite">Unité</option>
                  <option value="litre">Litre</option>
                  <option value="kg">Kilogramme</option>
                  <option value="m2">Mètre carré</option>
                  <option value="boite">Boîte</option>
                  <option value="pack">Pack</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Code produit
                </label>
                <input
                  name="code"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-background dark:border-dark-border dark:text-white"
                  placeholder="Ex: DET-MS-5L"
                />
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
                  <span>Créer le produit</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}