// app/api/dashboard/metrics/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { QuoteStatus, OrderStatus, InvoiceStatus, MissionStatus } from '@prisma/client';

export async function GET() {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const startOfMonth = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);

    const [
      unpaidInvoices,
      ongoingMissionsCount,
      totalEmployees,
      paidInvoicesThisMonth,
      missionsCompletedToday,
      // --- NOUVELLES DONNÉES RÉCUPÉRÉES ---
      recentQuotes,
      recentInvoices,
      monthlyExpenses
    ] = await Promise.all([
      prisma.invoice.aggregate({
        _sum: { totalTTC: true },
        where: { status: { in: [InvoiceStatus.SENT, InvoiceStatus.LATE] } },
      }),
      prisma.mission.count({ where: { status: MissionStatus.IN_PROGRESS } }),
      prisma.employee.count(),
      prisma.invoice.aggregate({
        _sum: { totalTTC: true },
        where: { status: 'PAID', date: { gte: startOfMonth } },
      }),
      prisma.mission.count({ 
        where: { status: { in: ['COMPLETED', 'VALIDATED'] }, actualEnd: { gte: todayStart, lte: todayEnd } } 
      }),
      // Récupérer les 5 devis les plus récents
      prisma.quote.findMany({
        take: 5,
        orderBy: { date: 'desc' },
        include: { client: { select: { nom: true } } }
      }),
      // Récupérer les 5 factures les plus récentes
      prisma.invoice.findMany({
        take: 5,
        orderBy: { date: 'desc' },
        include: { client: { select: { nom: true } } }
      }),
      // Agréger les dépenses du mois
      prisma.expense.aggregate({
        _sum: { amount: true },
        where: { date: { gte: startOfMonth } }
      })
    ]);

    const metrics = {
      commercial: {
        monthlyRevenue: paidInvoicesThisMonth._sum.totalTTC || 0,
        unpaidInvoicesAmount: unpaidInvoices._sum.totalTTC || 0,
      },
      operational: {
        ongoingMissions: ongoingMissionsCount,
        completedToday: missionsCompletedToday,
        totalEmployees: totalEmployees,
      },
      // --- NOUVELLES DONNÉES AJOUTÉES À LA RÉPONSE ---
      recentQuotes,
      recentInvoices,
      monthlyExpenses: monthlyExpenses._sum.amount || 0
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Erreur lors de la récupération des métriques:", error);
    return new NextResponse('Erreur Interne du Serveur', { status: 500 });
  }
}