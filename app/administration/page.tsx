// app/administration/page.tsx

import { Suspense } from 'react';
import { Euro, FileText, Briefcase, CheckSquare, Users } from 'lucide-react';
import MetricCard from '@/components/ui/MetricCard';
import { RevenueChart } from './components/charts/RevenueChart';
import { MissionStatusChart } from './components/charts/MissionStatusChart';

interface DashboardMetrics {
    commercial: {
        monthlyRevenue: number;
        unpaidInvoicesAmount: number;
    };
    operational: {
        ongoingMissions: number;
        completedToday: number;
        totalEmployees: number;
    };
}

interface ChartData {
    revenueChartData: any;
    missionStatusChartData: any;
}

// --- SKELETON COMPONENTS ---
function MetricCardSkeleton() {
    return (
        <div className="bg-white dark:bg-dark-container rounded-lg shadow-md p-5 h-40 flex flex-col justify-between animate-pulse">
            <div className="flex justify-end">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-dark-surface"></div>
            </div>
            <div className="flex flex-col items-center">
                <div className="h-8 w-32 bg-gray-200 rounded-md dark:bg-dark-surface mb-2"></div>
                <div className="h-4 w-24 bg-gray-200 rounded-md dark:bg-dark-surface"></div>
            </div>
        </div>
    );
}

function ChartSkeleton() {
    return (
        <div className="bg-white dark:bg-dark-container rounded-lg shadow-md p-6 h-[350px] animate-pulse"></div>
    );
}

// --- UTILITIES ---
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
}

// --- DATA FETCHING ---
async function getDashboardData() {
    // CORRECTION: Reverted to using a full URL, but with the correct fallback port (3000).
    // It's recommended to set NEXT_PUBLIC_APP_URL in your .env.local file.
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const [metricsRes, chartDataRes] = await Promise.all([
        fetch(`${baseUrl}/api/dashboard/metrics`, { cache: 'no-store' }),
        fetch(`${baseUrl}/api/dashboard/charts`, { cache: 'no-store' })
    ]);

    if (!metricsRes.ok) {
        console.error("Failed to fetch metrics:", metricsRes.status, metricsRes.statusText);
        throw new Error('Failed to fetch metrics');
    }

    const metrics: DashboardMetrics = await metricsRes.json();
    
    let chartData: ChartData | null = null;
    if (chartDataRes.ok) {
        chartData = await chartDataRes.json();
    } else {
        console.warn("Failed to fetch chart data:", chartDataRes.status, chartDataRes.statusText);
    }

    return { metrics, chartData };
}

// --- DATA DISPLAY COMPONENT ---
async function DashboardContent() {
    const { metrics, chartData } = await getDashboardData();

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <MetricCard
                    title="Chiffre d'affaires mensuel"
                    value={formatCurrency(metrics.commercial.monthlyRevenue)}
                    icon={<Euro className="w-6 h-6" />}
                    description="Total des revenus ce mois-ci"
                />
                <MetricCard
                    title="Factures impayées"
                    value={formatCurrency(metrics.commercial.unpaidInvoicesAmount)}
                    icon={<FileText className="w-6 h-6" />}
                    description="Montant total des factures impayées"
                />
                <MetricCard
                    title="Missions en cours"
                    value={metrics.operational.ongoingMissions}
                    icon={<Briefcase className="w-6 h-6" />}
                    description="Nombre de missions actives"
                />
                <MetricCard
                    title="Missions terminées"
                    value={metrics.operational.completedToday}
                    icon={<CheckSquare className="w-6 h-6" />}
                    description="Missions terminées aujourd'hui"
                />
                <MetricCard
                    title="Employés actifs"
                    value={metrics.operational.totalEmployees}
                    icon={<Users className="w-6 h-6" />}
                    description="Nombre total d'employés"
                />
            </div>

            {chartData ? (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                    <div className="lg:col-span-3">
                        <RevenueChart data={chartData.revenueChartData} />
                    </div>
                    <div className="lg:col-span-2">
                        <MissionStatusChart data={chartData.missionStatusChartData} />
                    </div>
                </div>
            ) : (
                <div className="p-6 bg-white dark:bg-dark-container rounded-lg shadow-md">
                    <p className="text-red-500 dark:text-red-400">
                        Impossible de charger les graphiques.
                    </p>
                </div>
            )}
        </div>
    );
}

// --- MAIN PAGE COMPONENT ---
export default async function DashboardPage() {
    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-semibold">Tableau de bord</h1>
            <Suspense fallback={
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        {[...Array(5)].map((_, i) => <MetricCardSkeleton key={i} />)}
                    </div>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                        <div className="lg:col-span-3"><ChartSkeleton /></div>
                        <div className="lg:col-span-2"><ChartSkeleton /></div>
                    </div>
                </div>
            }>
                <DashboardContent />
            </Suspense>
        </div>
    );
}