// app/services/analyticsService.ts
import prisma from "@/lib/prisma";
import { InvoiceStatus, MissionStatus } from "@prisma/client";

// Interface pour les métriques du dashboard
export interface DashboardMetrics {
  commercial: {
    pendingQuotes: number;
    unpaidInvoicesAmount: number;
    monthlyRevenue: number;
  };
  operational: {
    ongoingMissions: number;
    completedToday: number;
    totalEmployees: number;
  };
}

/**
 * Calcule les métriques clés pour le tableau de bord.
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [
    pendingQuotesCount,
    unpaidInvoices,
    paidInvoicesThisMonth,
    ongoingMissionsCount,
    missionsCompletedToday,
    totalEmployees,
  ] = await Promise.all([
    prisma.quote.count({ where: { status: 'SENT' } }),
    prisma.invoice.aggregate({
      _sum: { totalTTC: true },
      where: { status: { in: ['SENT', 'LATE'] } },
    }),
    prisma.invoice.aggregate({
        _sum: { totalTTC: true },
        where: { 
            status: 'PAID',
            date: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
        },
    }),
    prisma.mission.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.mission.count({ 
        where: { 
            status: { in: ['COMPLETED', 'VALIDATED'] },
            actualEnd: { gte: todayStart, lte: todayEnd }
        } 
    }),
    prisma.employee.count(),
  ]);

  return {
    commercial: {
      pendingQuotes: pendingQuotesCount,
      unpaidInvoicesAmount: unpaidInvoices._sum.totalTTC || 0,
      monthlyRevenue: paidInvoicesThisMonth._sum.totalTTC || 0,
    },
    operational: {
      ongoingMissions: ongoingMissionsCount,
      completedToday: missionsCompletedToday,
      totalEmployees: totalEmployees,
    },
  };
}