// app/api/dashboard/activity/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // Fetch the last 10 significant events
        const [recentQuotes, recentMissions, recentInvoices] = await Promise.all([
            // Recently accepted quotes
            prisma.quote.findMany({
                where: { status: 'ACCEPTED' },
                orderBy: { updatedAt: 'desc' },
                take: 4,
                include: { client: { select: { nom: true } } }
            }),
            // Recently completed missions
            prisma.mission.findMany({
                where: { status: 'COMPLETED' },
                orderBy: { actualEnd: 'desc' },
                take: 4,
                include: { order: { select: { client: { select: { nom: true } } } } }
            }),
            // Recently paid invoices
            prisma.invoice.findMany({
                where: { status: 'PAID' },
                orderBy: { updatedAt: 'desc' },
                take: 4,
                include: { client: { select: { nom: true } } }
            }),
        ]);

        // Format the events into a unified activity feed format
        const activities = [
            ...recentQuotes.map(q => ({
                id: q.id,
                type: 'DEVIS ACCEPTÉ',
                description: `Le devis pour ${q.client.nom} a été accepté.`,
                date: q.updatedAt,
                link: `/administration/quotes/${q.id}`
            })),
            ...recentMissions.map(m => ({
                id: m.id,
                type: 'MISSION TERMINÉE',
                description: `Mission chez ${m.order?.client.nom || 'un client'} terminée.`,
                date: m.actualEnd,
                link: `/administration/missions/${m.id}`
            })),
            ...recentInvoices.map(i => ({
                id: i.id,
                type: 'FACTURE PAYÉE',
                description: `La facture ${i.invoiceNumber} pour ${i.client.nom} a été payée.`,
                date: i.updatedAt,
                link: `/administration/invoices/${i.id}`
            }))
        ];

        // Sort all activities by date descending and take the most recent 10
        const sortedActivities = activities
            .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
            .slice(0, 10);

        return NextResponse.json(sortedActivities);

    } catch (error) {
        console.error("Erreur API [GET_ACTIVITY_FEED]:", error);
        return new NextResponse('Erreur Interne du Serveur', { status: 500 });
    }
}