// app/administration/page.tsx
import { Suspense } from 'react';
import { FileText, Briefcase, Users, Euro, Wallet } from 'lucide-react';
import { WelcomeBanner } from './components/dashboard/WelcomeBanner';
import { MetricCard } from './components/dashboard/MetricCard';
import { ActivityFeed } from './components/dashboard/ActivityFeed';
import { RecentDocumentsList } from './components/dashboard/RecentDocumentsList';

// Types pour les données récupérées
interface DashboardData {
    commercial: { monthlyRevenue: number; unpaidInvoicesAmount: number; };
    operational: { ongoingMissions: number; totalEmployees: number; };
    recentQuotes: any[];
    recentInvoices: any[];
    monthlyExpenses: number;
}

// 🔧 CORRECTION: Fonction pour récupérer les données via API avec fallback
async function getDashboardData(): Promise<DashboardData> {
    try {
        // 🔧 CORRECTION: URL absolue pour Vercel
        const baseUrl = process.env.VERCEL_URL 
            ? `https://${process.env.VERCEL_URL}` 
            : process.env.NEXTAUTH_URL || 'http://localhost:3000';
            
        console.log("🔍 Fetching dashboard data from:", `${baseUrl}/api/dashboard/metrics`);
        
        const res = await fetch(`${baseUrl}/api/dashboard/metrics`, { 
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log("✅ Dashboard data loaded successfully:", {
            quotesCount: data.recentQuotes?.length || 0,
            invoicesCount: data.recentInvoices?.length || 0
        });
        
        return data;
    } catch (error) {
        console.error("❌ Dashboard data fetching error:", error);
        // 🔧 AMÉLIORATION: Retourner des données par défaut
        return {
            commercial: { monthlyRevenue: 0, unpaidInvoicesAmount: 0 },
            operational: { ongoingMissions: 0, totalEmployees: 0 },
            recentQuotes: [],
            recentInvoices: [],
            monthlyExpenses: 0,
        };
    }
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('fr-MA', { 
    style: 'currency', 
    currency: 'MAD' 
}).format(amount);

// Composant principal du contenu du tableau de bord
async function DashboardContent() {
    const data = await getDashboardData();
    
    return (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Colonne principale (plus large) */}
            <div className="xl:col-span-3 space-y-6">
                <WelcomeBanner />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard 
                        title="Revenu Mensuel" 
                        value={formatCurrency(data.commercial.monthlyRevenue)} 
                        icon={<Euro size={20} />} 
                        color="green" 
                    />
                    <MetricCard 
                        title="Factures Impayées" 
                        value={formatCurrency(data.commercial.unpaidInvoicesAmount)} 
                        icon={<FileText size={20} />} 
                        color="yellow" 
                    />
                    <MetricCard 
                        title="Dépenses du Mois" 
                        value={formatCurrency(data.monthlyExpenses)} 
                        icon={<Wallet size={20} />} 
                        color="purple" 
                    />
                    <MetricCard 
                        title="Missions en Cours" 
                        value={data.operational.ongoingMissions} 
                        icon={<Briefcase size={20} />} 
                        color="blue" 
                    />
                </div>

                {/* 📋 SECTION DOCUMENTS RÉCENTS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <RecentDocumentsList 
                        title="Devis Récents"
                        items={data.recentQuotes.map(q => ({ 
                            id: q.id, 
                            number: q.quoteNumber, 
                            clientName: q.client?.nom || 'Client inconnu',
                            amount: q.totalTTC, 
                            status: q.status 
                        }))}
                        viewAllLink="/administration/quotes"
                        type="quote"
                    />
                    <RecentDocumentsList 
                        title="Factures Récentes"
                        items={data.recentInvoices.map(i => ({ 
                            id: i.id, 
                            number: i.invoiceNumber, 
                            clientName: i.client?.nom || 'Client inconnu',
                            amount: i.totalTTC, 
                            status: i.status 
                        }))}
                        viewAllLink="/administration/invoices"
                        type="invoice"
                    />
                </div>
            </div>

            {/* Colonne latérale (plus étroite) */}
            <div className="xl:col-span-1">
                <ActivityFeed />
            </div>
        </div>
    );
}

// Page principale
export default function DashboardPage() {
    return (
        <div className="space-y-6">
             <Suspense fallback={
                 <div className="animate-pulse space-y-6">
                    <div className="h-24 bg-gray-200 dark:bg-dark-surface rounded-2xl"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-24 bg-gray-200 dark:bg-dark-surface rounded-2xl"></div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="h-80 bg-gray-200 dark:bg-dark-surface rounded-2xl"></div>
                         <div className="h-80 bg-gray-200 dark:bg-dark-surface rounded-2xl"></div>
                    </div>
                 </div>
             }>
                <DashboardContent />
             </Suspense>
        </div>
    );
}