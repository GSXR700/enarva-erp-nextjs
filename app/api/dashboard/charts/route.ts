// app/api/dashboard/charts/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { MissionStatus } from '@prisma/client';

export async function GET() {
  try {
    // --- 1. Données pour le graphique des revenus mensuels (6 derniers mois) ---
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenueData = await prisma.invoice.groupBy({
      by: ['date'],
      _sum: {
        totalTTC: true,
      },
      where: {
        status: 'PAID',
        date: {
          gte: sixMonthsAgo,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
    
    // Formater les données pour le graphique
    const formattedRevenue = monthlyRevenueData.reduce((acc, record) => {
        const month = record.date.toLocaleString('fr-FR', { month: 'long' });
        const year = record.date.getFullYear();
        const monthYear = `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
        
        if (!acc[monthYear]) {
            acc[monthYear] = 0;
        }
        acc[monthYear] += record._sum.totalTTC || 0;
        
        return acc;
    }, {} as { [key: string]: number });

    const revenueChartData = Object.keys(formattedRevenue).map(key => ({
        name: key.substring(0, 3), // ex: "Jan", "Fév"
        total: formattedRevenue[key],
    }));

    // --- 2. Données pour le graphique de statut des missions ---
    const missionStatusCounts = await prisma.mission.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });
    
    const missionStatusChartData = missionStatusCounts.map(item => ({
        name: item.status,
        value: item._count.id,
    }));

    return NextResponse.json({
      revenueChartData,
      missionStatusChartData,
    });
    
  } catch (error) {
    console.error("Erreur lors de la récupération des données pour les graphiques:", error);
    return new NextResponse('Erreur Interne du Serveur', { status: 500 });
  }
}