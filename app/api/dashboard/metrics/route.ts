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
      }).catch(() => ({ _sum: { amount: 0 } })) // 🔧 Gestion d'erreur si table expense n'existe pas
    ]);

    // 🔧 CORRECTION PRINCIPALE: Sérialisation des dates pour Vercel
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
      // 🔧 CORRECTION: Convertir les dates en strings pour éviter les erreurs de sérialisation
      recentQuotes: recentQuotes.map(quote => ({
        ...quote,
        date: quote.date.toISOString(), // Date → string ISO
        createdAt: quote.createdAt.toISOString(),
        updatedAt: quote.updatedAt.toISOString()
      })),
      recentInvoices: recentInvoices.map(invoice => ({
        ...invoice,
        date: invoice.date.toISOString(), // Date → string ISO
        dueDate: invoice.dueDate.toISOString(),
        createdAt: invoice.createdAt.toISOString(),
        updatedAt: invoice.updatedAt.toISOString()
      })),
      monthlyExpenses: monthlyExpenses._sum?.amount || 0
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Erreur lors de la récupération des métriques dashboard:", error);
    
    // 🔧 AMÉLIORATION: Retourner des données par défaut au lieu d'une erreur 500
    const fallbackMetrics = {
      commercial: {
        monthlyRevenue: 0,
        unpaidInvoicesAmount: 0,
      },
      operational: {
        ongoingMissions: 0,
        completedToday: 0,
        totalEmployees: 0,
      },
      recentQuotes: [],
      recentInvoices: [],
      monthlyExpenses: 0
    };

    return NextResponse.json(fallbackMetrics);
  }
}