// app/api/dashboard/metrics/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { QuoteStatus, OrderStatus, InvoiceStatus, MissionStatus } from '@prisma/client';

export async function GET() {
  try {
    // Définition des bornes pour "aujourd'hui"
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      pendingQuotesCount,
      activeOrdersCount,
      unpaidInvoices,
      ongoingMissionsCount,
      totalClients,
      totalEmployees,
      // NOUVELLES REQUÊTES
      paidInvoicesThisMonth,
      missionsCompletedToday,
    ] = await Promise.all([
      prisma.quote.count({ where: { status: QuoteStatus.SENT } }),
      prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      prisma.invoice.aggregate({
        _sum: { totalTTC: true },
        where: { status: { in: [InvoiceStatus.SENT, InvoiceStatus.LATE] } },
      }),
      prisma.mission.count({ where: { status: MissionStatus.IN_PROGRESS } }),
      prisma.client.count(),
      prisma.employee.count(),
      // NOUVEAU: Calcule le CA du mois
      prisma.invoice.aggregate({
        _sum: { totalTTC: true },
        where: { 
            status: 'PAID',
            date: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
        },
      }),
      // NOUVEAU: Calcule les missions terminées aujourd'hui
      prisma.mission.count({ 
        where: { 
            status: { in: ['COMPLETED', 'VALIDATED'] },
            actualEnd: { gte: todayStart, lte: todayEnd }
        } 
      }),
    ]);

    const metrics = {
      commercial: {
        pendingQuotes: pendingQuotesCount,
        activeOrders: activeOrdersCount,
        unpaidInvoicesAmount: unpaidInvoices._sum.totalTTC || 0,
        monthlyRevenue: paidInvoicesThisMonth._sum.totalTTC || 0, // NOUVEAU
      },
      operational: {
        ongoingMissions: ongoingMissionsCount,
        totalClients: totalClients,
        totalEmployees: totalEmployees,
        completedToday: missionsCompletedToday, // NOUVEAU
      },
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Erreur lors de la récupération des métriques du dashboard:", error);
    return new NextResponse('Erreur Interne du Serveur', { status: 500 });
  }
}