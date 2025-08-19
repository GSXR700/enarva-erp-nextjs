import prisma from "@/lib/prisma";
import { NewMissionForm } from "./components/NewMissionForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Nouvelle Mission | Enarva Admin',
  description: 'Créer une nouvelle mission',
};

export default async function NewMissionPage() {
  const [orders, employees] = await Promise.all([
    prisma.order.findMany({
      include: { client: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.employee.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { firstName: 'asc' }
    }),
  ]);

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <NewMissionForm orders={orders} employees={employees} />
    </div>
  );
}