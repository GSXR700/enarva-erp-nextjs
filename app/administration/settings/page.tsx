// enarva-nextjs-app/app/administration/settings/page.tsx
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SettingsTabs } from "./components/SettingsTabs";

export default async function SettingsPage() {
  const [users, companyInfo, payRates, departments, services] = await Promise.all([
    prisma.user.findMany({ orderBy: { name: "asc" } }),
    prisma.companyInfo.findFirst(),
    prisma.payRate.findMany({ orderBy: { name: "asc" } }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.service.findMany({ orderBy: { name: "asc" } }), // Ajout de la récupération des services
  ]);

  if (!companyInfo) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">
        Réglages
      </h1>
      
      <SettingsTabs 
        users={users}
        companyInfo={companyInfo}
        payRates={payRates}
        departments={departments}
        services={services} // Passer les services au composant
      />
    </div>
  );
}