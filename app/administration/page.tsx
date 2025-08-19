import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { 
    Euro, 
    FileText, 
    Wallet, 
    Briefcase, 
    Users, 
    TrendingUp,
    Package,
    AlertCircle,
    CheckCircle2,
    Clock
} from 'lucide-react';

// Components existants (garder)
import { WelcomeBanner } from './components/dashboard/WelcomeBanner';
import { MetricCard } from './components/dashboard/MetricCard';
import { ActivityFeed } from './components/dashboard/ActivityFeed';
import { RecentDocumentsList } from './components/dashboard/RecentDocumentsList';
import { ExpensesList } from './components/dashboard/ExpensesList';
import { TeamOverview } from './components/dashboard/TeamOverview';
import { TasksWidget } from './components/dashboard/TasksWidget';
import { QuickActions } from './components/dashboard/QuickActions';

// Nouveaux components pour le dashboard exécutif
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { DashboardSkeleton } from './components/dashboard/DashboardSkeleton';

import prisma from '@/lib/prisma';

async function getDashboardData() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

    const [
        monthlyRevenue,
        unpaidInvoices,
        monthlyExpenses,
        ongoingMissions,
        recentQuotes,
        recentInvoices,
        recentExpenses,
        teamMembers,
        completedMissionsToday,
        recentLeads,
        activeContracts
    ] = await Promise.all([
        prisma.invoice.aggregate({
            _sum: { totalTTC: true },
            where: { status: 'PAID', date: { gte: firstDayOfMonth, lte: lastDayOfMonth } }
        }),
        prisma.invoice.aggregate({
            _sum: { totalTTC: true },
            _count: { id: true },
            where: { status: { in: ['SENT', 'LATE'] } }
        }),
        prisma.expense.aggregate({
            _sum: { amount: true },
            where: { date: { gte: firstDayOfMonth, lte: lastDayOfMonth } }
        }).catch(() => ({ _sum: { amount: 0 } })),
        prisma.mission.count({ where: { status: 'IN_PROGRESS' } }),
        prisma.quote.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { client: { select: { nom: true } } }
        }),
        prisma.invoice.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { client: { select: { nom: true } } }
        }),
        prisma.expense.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { supplier: { select: { name: true } } }
        }).catch(() => []),
        prisma.employee.findMany({
            take: 10,
            include: { user: { select: { name: true, email: true, isOnline: true } } }
        }),
        prisma.mission.count({
            where: {
                status: { in: ['COMPLETED', 'VALIDATED'] },
                actualEnd: { gte: startOfToday, lte: endOfToday }
            }
        }),
        prisma.lead.findMany({
            take: 5,
            orderBy: { date_creation: 'desc' },
            include: { assignedTo: { select: { name: true } } }
        }),
        prisma.contrat.count({ where: { dateFin: { gte: today } } }).catch(() => 0)
    ]);

    return {
        metrics: {
            monthlyRevenue: monthlyRevenue._sum.totalTTC || 0,
            unpaidInvoicesAmount: unpaidInvoices._sum.totalTTC || 0,
            unpaidInvoicesCount: unpaidInvoices._count.id || 0,
            monthlyExpenses: monthlyExpenses._sum.amount || 0,
            ongoingMissions,
            completedMissionsToday,
            activeContracts
        },
        recentQuotes,
        recentInvoices,
        recentExpenses,
        teamMembers,
        pendingTasks: teamMembers.filter(member => member.user.isOnline).map(task => ({
            id: task.id,
            title: `Mission assignée à ${task.firstName} ${task.lastName}`,
            status: 'TODO' as const,
            priority: 'MEDIUM' as const,
            dueDate: new Date(),
            assignedTo: task.user
        })),
        recentLeads
    };
}

const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount);

async function DashboardContent() {
    const session = await getServerSession(authOptions);
    
    if (!session) {
        redirect('/login');
    }

    const isExecutive = ['ADMIN', 'MANAGER'].includes(session.user.role);
    
    if (isExecutive) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Centre de Commandement Exécutif
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Pilotage stratégique et opérationnel Enarva SARL AU
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        Temps Réel
                    </div>
                </div>
                <ExecutiveDashboard />
            </div>
        );
    }

    // Dashboard simple pour les autres rôles
    const data = await getDashboardData();
    
    return (
        <div className="space-y-6">
            <WelcomeBanner />
            
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
                <MetricCard 
                    title="Revenu Mensuel" 
                    value={formatCurrency(data.metrics.monthlyRevenue)} 
                    icon={<TrendingUp size={20} />} 
                    color="green"
                />
                <MetricCard 
                    title="Factures Impayées" 
                    value={formatCurrency(data.metrics.unpaidInvoicesAmount)} 
                    icon={<AlertCircle size={20} />} 
                    color="yellow"
                />
                <MetricCard 
                    title="Dépenses du Mois" 
                    value={formatCurrency(data.metrics.monthlyExpenses)} 
                    icon={<Wallet size={20} />} 
                    color="purple"
                />
                <MetricCard 
                    title="Missions en Cours" 
                    value={data.metrics.ongoingMissions.toString()} 
                    icon={<Briefcase size={20} />} 
                    color="blue"
                />
                <MetricCard 
                    title="Équipe Active" 
                    value={data.teamMembers.length.toString()} 
                    icon={<Users size={20} />} 
                    color="blue"
                />
                <MetricCard 
                    title="Complétées Aujourd'hui" 
                    value={data.metrics.completedMissionsToday.toString()} 
                    icon={<CheckCircle2 size={20} />} 
                    color="green"
                />
            </div>

            <QuickActions />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                        <RecentDocumentsList 
                            title="Devis Récents"
                            items={data.recentQuotes.map(q => ({ 
                                id: q.id, 
                                number: q.quoteNumber, 
                                clientName: q.client.nom, 
                                amount: q.totalTTC, 
                                status: q.status,
                                date: q.createdAt
                            }))}
                            viewAllLink="/administration/quotes"
                            type="quote"
                        />
                        <RecentDocumentsList 
                            title="Factures Récentes"
                            items={data.recentInvoices.map(i => ({ 
                                id: i.id, 
                                number: i.invoiceNumber, 
                                clientName: i.client.nom, 
                                amount: i.totalTTC, 
                                status: i.status,
                                date: i.date
                            }))}
                            viewAllLink="/administration/invoices"
                            type="invoice"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                        <ExpensesList 
                            expenses={data.recentExpenses.map(e => ({
                                id: e.id,
                                description: e.description,
                                amount: e.amount,
                                date: e.date,
                                status: 'APPROVED',
                                category: { name: e.category },
                                supplier: e.supplier ? { name: e.supplier.name } : null
                            }))}
                            viewAllLink="/administration/expenses"
                        />
                        <TasksWidget 
                            tasks={data.pendingTasks}
                            viewAllLink="/administration/missions"
                        />
                    </div>

                    <TeamOverview 
                        teamMembers={data.teamMembers.map(member => ({
                            id: member.id,
                            name: member.user.name || `${member.firstName} ${member.lastName}`,
                            email: member.user.email,
                            phone: member.phone,
                            status: member.user.isOnline ? 'ONLINE' : 'OFFLINE',
                            role: member.type,
                            avatar: null
                        }))}
                        viewAllLink="/administration/employees"
                    />
                </div>

                <div className="space-y-6">
                    <ActivityFeed />
                </div>
            </div>
        </div>
    );
}

export default async function AdminDashboardPage() {
    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <DashboardContent />
        </Suspense>
    );
}