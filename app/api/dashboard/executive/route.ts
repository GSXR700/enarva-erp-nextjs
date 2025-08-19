import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const endOfToday = new Date(today.setHours(23, 59, 59, 999));

        const [
            commercialData,
            operationalData,
            financialData,
            hrData,
            customerData,
            inventoryData
        ] = await Promise.all([
            getCommercialPerformance(startOfMonth),
            getOperationalMetrics(startOfToday, endOfToday),
            getFinancialMetrics(startOfMonth),
            getHRMetrics(),
            getCustomerExperience(),
            getInventoryMetrics()
        ]);

        return NextResponse.json({
            commercial: commercialData,
            operational: operationalData,
            financial: financialData,
            hr: hrData,
            customer: customerData,
            inventory: inventoryData,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Erreur API dashboard executive:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

async function getCommercialPerformance(startOfMonth: Date) {
    const [leadsCount, conversions, topClients] = await Promise.all([
        prisma.lead.groupBy({
            by: ['canal'],
            _count: { id: true },
            where: { date_creation: { gte: startOfMonth } }
        }),
        prisma.lead.groupBy({
            by: ['statut'],
            _count: { id: true },
            where: { date_creation: { gte: startOfMonth } }
        }),
        prisma.client.findMany({
            take: 10,
            include: {
                invoices: { select: { totalTTC: true } },
                orders: { select: { totalTTC: true } }
            },
            orderBy: { date_entree: 'desc' }
        })
    ]);

    const leadsBySource = leadsCount.reduce((acc, item) => {
        acc[item.canal] = item._count.id;
        return acc;
    }, {} as Record<string, number>);

    const conversionFunnel = conversions.reduce((acc, item) => {
        acc[item.statut] = item._count.id;
        return acc;
    }, {} as Record<string, number>);

    return {
        leadIntelligence: {
            sources: {
                whatsapp: { count: leadsBySource.WHATSAPP || 0, trend: 12, quality: 85, conversionRate: 45 },
                facebook: { count: leadsBySource.FACEBOOK || 0, conversion: 32, engagement: 78 },
                instagram: { count: leadsBySource.INSTAGRAM || 0, engagement: 65, storyViews: 1250 },
                website: { count: leadsBySource.SITE_WEB || 0, sources: ['SEO', 'Direct'], bounceRate: 35 },
                referrals: { count: leadsBySource.RECOMMANDATION_CLIENT || 0, referrers: [], quality: 92 }
            },
            conversionFunnel: {
                newLead: conversionFunnel.new_lead || 0,
                qualified: conversionFunnel.qualified || 0,
                visitScheduled: conversionFunnel.visit_scheduled || 0,
                quoteSent: conversionFunnel.quote_sent || 0,
                quoteAccepted: conversionFunnel.quote_accepted || 0,
                clientConfirmed: conversionFunnel.client_confirmed || 0
            }
        },
        topClients: topClients.map(client => ({
            id: client.id,
            name: client.nom,
            type: client.type,
            ltv: client.invoices.reduce((sum, inv) => sum + inv.totalTTC, 0),
            monthlyValue: client.orders.reduce((sum, ord) => sum + ord.totalTTC, 0) / 12,
            status: client.statut,
            riskScore: Math.floor(Math.random() * 100),
            satisfactionScore: Math.floor(Math.random() * 100),
            lastInteraction: client.date_entree,
            nextAction: 'Appel de suivi'
        }))
    };
}

async function getOperationalMetrics(startOfToday: Date, endOfToday: Date) {
    const [inProgressMissions, completedToday, employees] = await Promise.all([
        prisma.mission.findMany({
            where: { status: 'IN_PROGRESS' },
            include: {
                assignedTo: { include: { user: true } },
                order: { include: { client: true } }
            }
        }),
        prisma.mission.count({
            where: {
                status: { in: ['COMPLETED', 'VALIDATED'] },
                actualEnd: { gte: startOfToday, lte: endOfToday }
            }
        }),
        prisma.employee.count()
    ]);

    return {
        missionControl: {
            realTime: {
                inProgress: inProgressMissions.map(mission => ({
                    missionId: mission.id,
                    client: mission.order?.client.nom || 'Client inconnu',
                    employeeId: mission.assignedToId || '',
                    employeeName: mission.assignedTo ? 
                        `${mission.assignedTo.firstName} ${mission.assignedTo.lastName}` : 'Non assigné',
                    location: { lat: 33.9716, lng: -6.8498, address: 'Rabat, Maroc' },
                    progress: Math.floor(Math.random() * 100),
                    estimatedCompletion: mission.scheduledEnd || new Date(),
                    actualStart: mission.actualStart || new Date(),
                    issues: [],
                    qualityChecks: []
                })),
                planned: { today: [], tomorrow: [], thisWeek: [], unassigned: [] },
                completed: { today: completedToday, thisWeek: 0, monthToDate: 0, successRate: 94 }
            },
            efficiency: {
                avgExecutionTime: 120,
                planVsActual: 87,
                reworkRate: 5,
                customerSatisfaction: 4.6,
                employeeUtilization: 85
            }
        },
        teamMetrics: {
            totalEmployees: employees,
            available: employees - inProgressMissions.length,
            deployed: inProgressMissions.length
        }
    };
}

async function getFinancialMetrics(startOfMonth: Date) {
    const [monthlyRevenue, unpaidInvoices, expenses] = await Promise.all([
        prisma.invoice.aggregate({
            _sum: { totalTTC: true },
            where: { status: 'PAID', date: { gte: startOfMonth } }
        }),
        prisma.invoice.aggregate({
            _sum: { totalTTC: true },
            where: { status: { in: ['SENT', 'LATE'] } }
        }),
        prisma.expense.aggregate({
            _sum: { amount: true },
            where: { date: { gte: startOfMonth } }
        }).catch(() => ({ _sum: { amount: 0 } }))
    ]);

    return {
        revenue: {
            monthly: {
                ttc: monthlyRevenue._sum.totalTTC || 0,
                ht: (monthlyRevenue._sum.totalTTC || 0) * 0.83,
                growth: 12.5,
                forecast: (monthlyRevenue._sum.totalTTC || 0) * 1.15
            },
            realTime: {
                todayTarget: 15000,
                todayActual: 12500,
                variance: -16.7
            }
        },
        cashflow: {
            position: {
                currentBalance: 145000,
                projectedBalance: 180000,
                runway: 45
            },
            incoming: {
                invoiced: unpaidInvoices._sum.totalTTC || 0,
                collected: monthlyRevenue._sum.totalTTC || 0,
                overdue: { total: unpaidInvoices._sum.totalTTC || 0 }
            },
            outgoing: {
                suppliers: expenses._sum.amount || 0,
                payroll: 85000,
                fixedCosts: 25000,
                variableCosts: 15000
            }
        },
        profitability: {
            margins: {
                gross: 35.5,
                net: 18.2,
                ebitda: 22.8
            }
        }
    };
}

async function getHRMetrics() {
    const [totalEmployees, activeEmployees] = await Promise.all([
        prisma.employee.count(),
        prisma.employee.count({ where: { user: { isOnline: true } } })
    ]);

    return {
        workforce: {
            realTimeStatus: {
                available: [],
                deployed: [],
                utilization: totalEmployees > 0 ? (activeEmployees / totalEmployees) * 100 : 0
           }
       },
       performance: {
           topPerformers: [],
           teamMetrics: {
               productivityIndex: 87,
               revenuePerEmployee: 125000,
               retentionRate: 92
           }
       }
   };
}

async function getCustomerExperience() {
   const [openTickets, resolvedTickets] = await Promise.all([
       prisma.ticketSAV.count({ where: { statut: 'OUVERT' } }),
       prisma.ticketSAV.count({ where: { statut: 'RESOLU' } })
   ]);

   return {
       satisfaction: {
           scores: { nps: 65, csat: 4.5, ces: 3.2, retention: 88 },
           sentiment: { positive: 75, neutral: 20, negative: 5, trending: 'improving' as const }
       },
       support: {
           tickets: { open: [], inProgress: [], resolved: [] },
           metrics: { avgResolutionTime: 4.5, firstCallResolution: 78, satisfactionScore: 4.3 }
       }
   };
}

async function getInventoryMetrics() {
   return {
       inventory: {
           critical: [],
           value: { totalValue: 125000, turnoverRate: 6.5 }
       },
       equipment: {
           fleet: { vehicles: [], tools: [] },
           maintenance: { due: [], overdue: [], cost: { thisMonth: 5500 } }
       }
   };
}