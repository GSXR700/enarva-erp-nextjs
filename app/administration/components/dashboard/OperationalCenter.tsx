"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Activity, MapPin, Clock, CheckCircle, Users } from 'lucide-react';

interface OperationalCenterProps {
    data: any;
    compact?: boolean;
}

export function OperationalCenter({ data, compact = false }: OperationalCenterProps) {
    if (!data) return <div>Chargement des données opérationnelles...</div>;

    const LiveMissions = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Missions en Temps Réel
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {data.missionControl.realTime.inProgress.slice(0, compact ? 3 : 10).map((mission: any) => (
                        <div key={mission.missionId} className="p-3 border rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <div className="font-medium text-sm">{mission.client}</div>
                                <div className="text-xs text-gray-500">{mission.employeeName}</div>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {mission.location.address}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {mission.progress}%
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                    className="bg-blue-600 h-1.5 rounded-full transition-all"
                                    style={{ width: `${mission.progress}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );

    const EfficiencyMetrics = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Efficacité Opérationnelle
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-xl font-bold text-green-600">
                            {data.missionControl.efficiency.planVsActual}%
                        </div>
                        <div className="text-xs text-gray-600">Respect Planning</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-xl font-bold text-blue-600">
                            {data.missionControl.efficiency.customerSatisfaction}
                        </div>
                        <div className="text-xs text-gray-600">Satisfaction</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="text-xl font-bold text-purple-600">
                            {data.missionControl.efficiency.avgExecutionTime}min
                        </div>
                        <div className="text-xs text-gray-600">Temps Moyen</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <div className="text-xl font-bold text-orange-600">
                            {data.missionControl.efficiency.reworkRate}%
                        </div>
                        <div className="text-xs text-gray-600">Reprises</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const TeamStatus = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    État de l'Équipe
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                            {data.teamMetrics.available}
                        </div>
                        <div className="text-xs text-gray-600">Disponibles</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                            {data.teamMetrics.deployed}
                        </div>
                        <div className="text-xs text-gray-600">Déployés</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-gray-600">
                            {data.teamMetrics.totalEmployees}
                        </div>
                        <div className="text-xs text-gray-600">Total</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    if (compact) {
        return (
            <div className="space-y-4">
                <EfficiencyMetrics />
                <TeamStatus />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
                <LiveMissions />
            </div>
            <div className="space-y-4">
                <EfficiencyMetrics />
                <TeamStatus />
            </div>
        </div>
    );
}