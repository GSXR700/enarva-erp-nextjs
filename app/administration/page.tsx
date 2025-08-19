// app/administration/page.tsx
import { Suspense } from 'react';
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
import { WelcomeBanner } from './components/dashboard/WelcomeBanner';
import { MetricCard } from './components/dashboard/MetricCard';
import { ActivityFeed } from './components/dashboard/ActivityFeed';
import { RecentDocumentsList } from './components/dashboard/RecentDocumentsList';
import { ExpensesList } from './components/dashboard/ExpensesList';
import { TeamOverview } from './components/dashboard/TeamOverview';
import { TasksWidget } from './components/dashboard/TasksWidget';
import { QuickActions } from './components/dashboard/QuickActions';
import prisma from '@/lib/prisma';

// Fonction pour récupérer toutes les données du dashboard
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
        // Revenu mensuel (factures payées)
        prisma.invoice.aggregate({
            where: {
                status: 'PAID',
                date: { gte: firstDayOfMonth, lte: lastDayOfMonth }
            },
            _sum: { totalTTC: true }
        }),
        
        // Factures impayées
        prisma.invoice.aggregate({
            where: { 
                status: { 
                    in: ['SENT', 'LATE'] 
                } 
            },
            _sum: { totalTTC: true },
            _count: true
        }),
        
        // Dépenses mensuelles
        prisma.expense.aggregate({
            where: {
                date: { gte: firstDayOfMonth, lte: lastDayOfMonth }
            },
            _sum: { amount: true }
        }),
        
        // Missions en cours
        prisma.mission.count({
            where: { 
                status: { 
                    in: ['PENDING', 'IN_PROGRESS'] 
                } 
            }
        }),
        
        // 5 derniers devis
        prisma.quote.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { 
                client: { 
                    select: { nom: true } 
                } 
            }
        }),
        
        // 5 dernières factures
        prisma.invoice.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { 
                client: { 
                    select: { nom: true } 
                } 
            }
        }),
        
        // 5 dernières dépenses
        prisma.expense.findMany({
            orderBy: { date: 'desc' },
            take: 5,
            include: { 
                supplier: { 
                    select: { name: true } 
                }
            }
        }),
        
        // Membres de l'équipe (employés)
        prisma.employee.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        image: true,
                        isOnline: true,
                        lastSeen: true,
                        currentLatitude: true,
                        currentLongitude: true
                    }
                },
                missions: {
                    where: {
                        scheduledStart: { lte: endOfToday },
                        scheduledEnd: { gte: startOfToday },
                        status: { in: ['IN_PROGRESS', 'PENDING'] }
                    }
                }
            }
        }),
        
        // Missions complétées aujourd'hui
        prisma.mission.count({
            where: {
                status: 'COMPLETED',
                actualEnd: {
                    gte: startOfToday,
                    lte: endOfToday
                }
            }
        }),
        
        // Leads récents
        prisma.lead.findMany({
            orderBy: { date_creation: 'desc' },
            take: 5,
            include: {
                assignedTo: {
                    select: { name: true }
                }
            }
        }),
        
        // Contrats actifs
        prisma.contrat.count({
            where: {
                dateFin: { gte: today }
            }
        })
    ]);

    // Calcul des tâches en attente (basé sur les missions)
    const pendingTasks = await prisma.mission.findMany({
        where: {
            status: { in: ['PENDING', 'IN_PROGRESS'] },
            scheduledEnd: { gte: today }
        },
        orderBy: { scheduledEnd: 'asc' },
        take: 5,
        include: {
            assignedTo: {
                include: {
                    user: { select: { name: true } }
                }
            },
            order: {
                include: {
                    client: { select: { nom: true } }
                }
            }
        }
    });

    return {
        metrics: {
            monthlyRevenue: monthlyRevenue._sum.totalTTC || 0,
            unpaidInvoicesAmount: unpaidInvoices._sum.totalTTC || 0,
            unpaidInvoicesCount: unpaidInvoices._count || 0,
            monthlyExpenses: monthlyExpenses._sum.amount || 0,
            ongoingMissions,
            completedMissionsToday,
            activeContracts
        },
        recentQuotes,
        recentInvoices,
        recentExpenses,
        teamMembers,
        pendingTasks: pendingTasks.map(task => ({
            id: task.id,
            title: task.title || `Mission ${task.workOrderNumber || task.id.slice(-6)}`,
            description: task.notes,
            status: task.status === 'PENDING' ? 'TODO' : 'IN_PROGRESS',
            priority: 'MEDIUM',
            dueDate: task.scheduledEnd,
            assignedTo: task.assignedTo?.user
        })),
        recentLeads
    };
}

const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount);

// Composant principal du dashboard
async function DashboardContent() {
    const data = await getDashboardData();
    
    return (
        <div className="space-y-6">
            {/* Banner de bienvenue */}
            <WelcomeBanner />
            
            {/* Métriques principales - Responsive grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
                <MetricCard 
                    title="Revenu Mensuel" 
                    value={formatCurrency(data.metrics.monthlyRevenue)} 
                    icon={<TrendingUp size={20} />} 
                    color="green"
                    className="col-span-1" 
                />
                <MetricCard 
                    title="Factures Impayées" 
                    value={formatCurrency(data.metrics.unpaidInvoicesAmount)} 
                    subtitle={`${data.metrics.unpaidInvoicesCount} factures`}
                    icon={<AlertCircle size={20} />} 
                    color="yellow"
                    className="col-span-1" 
                />
                <MetricCard 
                    title="Dépenses du Mois" 
                    value={formatCurrency(data.metrics.monthlyExpenses)} 
                    icon={<Wallet size={20} />} 
                    color="purple"
                    className="col-span-1" 
                />
                <MetricCard 
                    title="Missions en Cours" 
                    value={data.metrics.ongoingMissions.toString()} 
                    icon={<Briefcase size={20} />} 
                    color="blue"
                    className="col-span-1" 
                />
                <MetricCard 
                    title="Équipe Active" 
                    value={data.teamMembers.length.toString()} 
                    icon={<Users size={20} />} 
                    color="indigo"
                    className="col-span-1" 
                />
                <MetricCard 
                    title="Complétées Aujourd'hui" 
                    value={data.metrics.completedMissionsToday.toString()} 
                    icon={<CheckCircle2 size={20} />} 
                    color="emerald"
                    className="col-span-1" 
                />
            </div>

            {/* Actions rapides - Mobile first */}
            <QuickActions />

            {/* Section principale avec layout responsive */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Colonne principale (2/3 sur desktop) */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Documents récents en grille responsive */}
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

                    {/* Widgets additionnels */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                        <ExpensesList 
                            expenses={data.recentExpenses.map(e => ({
                                id: e.id,
                                description: e.description,
                                amount: e.amount,
                                date: e.date,
                                status: 'APPROVED',
                                category: { name: e.category },
                                supplier: e.supplier
                            }))}
                            viewAllLink="/administration/expenses"
                        />
                        <TasksWidget 
                            tasks={data.pendingTasks}
                            viewAllLink="/administration/missions"
                        />
                    </div>

                    {/* Vue d'équipe */}
                    <TeamOverview 
                        teamMembers={data.teamMembers.map(member => ({
                            id: member.id,
                            name: member.user.name,
                            email: member.user.email,
                            phone: member.phone,
                            status: 'ACTIVE',
                            image: member.user.image,
                            missions: member.missions,
                            currentLatitude: member.user.currentLatitude,
                            currentLongitude: member.user.currentLongitude,
                            lastSeen: member.user.lastSeen,
                            isOnline: member.user.isOnline
                        }))}
                        viewAllLink="/administration/employees"
                    />

                    {/* Section Leads récents */}
                    <div className="bg-white dark:bg-dark-container p-4 sm:p-6 rounded-2xl shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Leads Récents</h3>
                            <a href="/administration/leads" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                Voir tout →
                            </a>
                        </div>
                        <div className="space-y-3">
                            {data.recentLeads.map(lead => (
                                <div key={lead.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-dark-surface rounded-lg">
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-dark-text">{lead.nom}</p>
                                        <p className="text-xs text-gray-500 dark:text-dark-subtle">
                                            {lead.canal} • {lead.assignedTo?.name || 'Non assigné'}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        lead.statut === 'new_lead' ? 'bg-blue-100 text-blue-800' :
                                        lead.statut === 'qualified' ? 'bg-green-100 text-green-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {lead.statut.replace('_', ' ')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Colonne latérale (1/3 sur desktop) */}
                <div className="xl:col-span-1">
                    <ActivityFeed />
                </div>
            </div>
        </div>
    );
}

// Page principale avec Suspense pour le chargement
export default function DashboardPage() {
    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <DashboardContent />
        </Suspense>
    );
}

// Skeleton pour le chargement
function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="h-24 bg-gray-200 dark:bg-dark-surface rounded-2xl animate-pulse" />
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-200 dark:bg-dark-surface rounded-2xl animate-pulse" />
                ))}
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="h-80 bg-gray-200 dark:bg-dark-surface rounded-2xl animate-pulse" />
                        <div className="h-80 bg-gray-200 dark:bg-dark-surface rounded-2xl animate-pulse" />
                    </div>
                </div>
                <div className="xl:col-span-1">
                    <div className="h-96 bg-gray-200 dark:bg-dark-surface rounded-2xl animate-pulse" />
                </div>
            </div>
        </div>
    );
}