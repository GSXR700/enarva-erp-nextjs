import prisma from "@/lib/prisma";
import { NewLeadForm } from "./components/NewLeadForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Nouveau Prospect | Enarva Admin',
  description: 'Créer un nouveau prospect',
};

export default async function NewLeadPage() {
  const [users, subcontractors] = await Promise.all([
    prisma.user.findMany({ orderBy: { name: "asc" } }),
    prisma.subcontractor.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <NewLeadForm users={users} subcontractors={subcontractors} />
    </div>
  );
}