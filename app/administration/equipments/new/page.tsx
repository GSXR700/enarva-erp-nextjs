import { NewEquipmentForm } from "./components/NewEquipmentForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Nouvel Équipement | Enarva Admin',
  description: 'Créer un nouvel équipement',
};

export default function NewEquipmentPage() {
  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <NewEquipmentForm />
    </div>
  );
}