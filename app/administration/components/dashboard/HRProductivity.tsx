"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Users, Award } from 'lucide-react';

interface HRProductivityProps {
    data: any;
    compact?: boolean;
}

export function HRProductivity({ data, compact = false }: HRProductivityProps) {
    if (!data) return <div>Chargement des données RH...</div>;

    const WorkforceStatus = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    État de l'Équipe
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                            {data.workforce.realTimeStatus.utilization.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">Utilisation</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                            {data.performance.teamMetrics.productivityIndex}
                        </div>
                        <div className="text-sm text-gray-600">Productivité</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const PerformanceMetrics = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Performance Équipe
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Revenu/Employé</span>
                        <span className="font-bold text-green-600">
                            {data.performance.teamMetrics.revenuePerEmployee.toLocaleString()} MAD
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Rétention</span>
                        <span className="font-bold text-blue-600">
                            {data.performance.teamMetrics.retentionRate}%
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    if (compact) {
        return <WorkforceStatus />;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WorkforceStatus />
            <PerformanceMetrics />
        </div>
    );
}