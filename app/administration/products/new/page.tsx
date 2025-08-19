import { NewProductForm } from "./components/NewProductForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Nouveau Produit | Enarva Admin',
  description: 'Créer un nouveau produit',
};

export default function NewProductPage() {
  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <NewProductForm />
    </div>
  );
}