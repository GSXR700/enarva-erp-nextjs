"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { DollarSign, TrendingUp, Wallet } from 'lucide-react';

interface FinancialControlProps {
    data: any;
    compact?: boolean;
}

export function FinancialControl({ data, compact = false }: FinancialControlProps) {
    if (!data) return <div>Chargement des données financières...</div>;

    const formatCurrency = (amount: number) => 
        new Intl.NumberFormat('fr-MA', { style: 'currency', currency : 'MAD' }).format(amount);

   const RevenueMetrics = () => (
       <Card>
           <CardHeader>
               <CardTitle className="flex items-center gap-2">
                   <TrendingUp className="h-5 w-5" />
                   Performance Revenus
               </CardTitle>
           </CardHeader>
           <CardContent>
               <div className="grid grid-cols-2 gap-4">
                   <div className="text-center p-4 bg-green-50 rounded-lg">
                       <div className="text-2xl font-bold text-green-600">
                           {formatCurrency(data.revenue.monthly.ttc)}
                       </div>
                       <div className="text-sm text-gray-600">Revenu Mensuel</div>
                       <div className="text-xs text-green-600">
                           +{data.revenue.monthly.growth}%
                       </div>
                   </div>
                   <div className="text-center p-4 bg-blue-50 rounded-lg">
                       <div className="text-2xl font-bold text-blue-600">
                           {formatCurrency(data.revenue.monthly.forecast)}
                       </div>
                       <div className="text-sm text-gray-600">Prévision</div>
                   </div>
               </div>
           </CardContent>
       </Card>
   );

   const CashflowStatus = () => (
       <Card>
           <CardHeader>
               <CardTitle className="flex items-center gap-2">
                   <Wallet className="h-5 w-5" />
                   Trésorerie
               </CardTitle>
           </CardHeader>
           <CardContent>
               <div className="space-y-4">
                   <div className="flex items-center justify-between">
                       <span className="text-sm font-medium">Solde Actuel</span>
                       <span className="font-bold text-green-600">
                           {formatCurrency(data.cashflow.position.currentBalance)}
                       </span>
                   </div>
                   <div className="flex items-center justify-between">
                       <span className="text-sm font-medium">Projection 30j</span>
                       <span className="font-bold text-blue-600">
                           {formatCurrency(data.cashflow.position.projectedBalance)}
                       </span>
                   </div>
                   <div className="flex items-center justify-between">
                       <span className="text-sm font-medium">Autonomie</span>
                       <span className="font-bold text-orange-600">
                           {data.cashflow.position.runway} jours
                       </span>
                   </div>
               </div>
           </CardContent>
       </Card>
   );

   const ProfitabilityMetrics = () => (
       <Card>
           <CardHeader>
               <CardTitle className="flex items-center gap-2">
                   <DollarSign className="h-5 w-5" />
                   Rentabilité
               </CardTitle>
           </CardHeader>
           <CardContent>
               <div className="grid grid-cols-3 gap-4">
                   <div className="text-center">
                       <div className="text-xl font-bold text-green-600">
                           {data.profitability.margins.gross}%
                       </div>
                       <div className="text-xs text-gray-600">Marge Brute</div>
                   </div>
                   <div className="text-center">
                       <div className="text-xl font-bold text-blue-600">
                           {data.profitability.margins.net}%
                       </div>
                       <div className="text-xs text-gray-600">Marge Nette</div>
                   </div>
                   <div className="text-center">
                       <div className="text-xl font-bold text-purple-600">
                           {data.profitability.margins.ebitda}%
                       </div>
                       <div className="text-xs text-gray-600">EBITDA</div>
                   </div>
               </div>
           </CardContent>
       </Card>
   );

   if (compact) {
       return <RevenueMetrics />;
   }

   return (
       <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
           <RevenueMetrics />
           <CashflowStatus />
           <ProfitabilityMetrics />
       </div>
   );
}