import prisma from "@/lib/prisma";
import { NewClientForm } from "./components/NewClientForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Nouveau Client | Enarva Admin',
  description: 'Créer un nouveau client',
};

export default async function NewClientPage() {
  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <NewClientForm />
    </div>
  );
}