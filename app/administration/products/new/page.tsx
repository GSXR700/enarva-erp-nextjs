// app/administration/products/new/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { ProductForm } from "../components/ProductForm";

export const metadata: Metadata = {
  title: 'Nouveau Produit | Enarva Admin',
  description: 'Créer un nouveau produit',
};

export default function NewProductPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">
          Créer un Nouveau Produit
        </h1>
        <Link 
          href="/administration/products"
          className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-dark-subtle dark:hover:text-dark-text transition"
        >
          ← Retour aux produits
        </Link>
      </div>
      
      <div className="bg-white dark:bg-dark-container rounded-lg shadow-md p-6">
        <ProductForm />
      </div>
    </div>
  );
}