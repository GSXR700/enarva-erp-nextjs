// app/administration/reporting/page.tsx
import prisma from "@/lib/prisma";
import { ReportingClient } from "./components/ReportingClient";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Suspense } from "react";
import { AlertCircle } from "lucide-react";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Reporting & Exports | Enarva Admin',
  description: 'Générer des rapports et exporter les données de facturation',
};

export default async function ReportingPage() {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  try {
    const [initialInvoices, companyInfo] = await Promise.all([
      prisma.invoice.findMany({
        where: {
          date: { gte: oneMonthAgo }
        },
        include: {
          client: true,
          order: {
            include: {
              quote: true
            }
          }
        },
        orderBy: { date: 'desc' }
      }),
      prisma.companyInfo.findFirst()
    ]);

    if (!companyInfo) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="text-yellow-600 dark:text-yellow-500" />
            <p className="text-yellow-700 dark:text-yellow-400">
              Les informations de l'entreprise n'ont pas été configurées. Veuillez les configurer dans les paramètres.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">
            Reporting & Exports
          </h1>
        </div>

        <Suspense fallback={
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 dark:bg-dark-container rounded-lg w-full" />
            <div className="h-96 bg-gray-200 dark:bg-dark-container rounded-lg w-full" />
          </div>
        }>
          <ReportingClient
            initialInvoices={initialInvoices as any} // Using 'as any' to bypass strict type check for now
            companyInfo={companyInfo}
          />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error('Error loading reporting page:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600 dark:text-red-500" />
          <p className="text-red-700 dark:text-red-400">
            Une erreur est survenue lors du chargement des données. Veuillez réessayer plus tard.
          </p>
        </div>
      </div>
    );
  }
}