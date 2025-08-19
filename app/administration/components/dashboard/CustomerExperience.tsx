"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Heart, MessageSquare } from 'lucide-react';

interface CustomerExperienceProps {
    data: any;
    compact?: boolean;
}

export function CustomerExperience({ data, compact = false }: CustomerExperienceProps) {
    if (!data) return <div>Chargement des données client...</div>;

    const SatisfactionScores = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Satisfaction Client
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                            {data.satisfaction.scores.nps}
                        </div>
                        <div className="text-sm text-gray-600">NPS Score</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                            {data.satisfaction.scores.csat}
                        </div>
                        <div className="text-sm text-gray-600">CSAT</div>
                    </div>
                    {!compact && (
                        <>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">
                                    {data.satisfaction.scores.retention}%
                                </div>
                                <div className="text-sm text-gray-600">Rétention</div>
                            </div>
                            <div className="text-center p-4 bg-orange-50 rounded-lg">
                                <div className="text-2xl font-bold text-orange-600">
                                    {data.satisfaction.scores.ces}
                                </div>
                                <div className="text-sm text-gray-600">CES</div>
                            </div>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    const SupportMetrics = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Support Client
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Résolution Moyenne</span>
                        <span className="font-bold text-blue-600">
                            {data.support.metrics.avgResolutionTime}h
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Premier Contact</span>
                        <span className="font-bold text-green-600">
                            {data.support.metrics.firstCallResolution}%
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Satisfaction SAV</span>
                        <span className="font-bold text-purple-600">
                            {data.support.metrics.satisfactionScore}/5
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    if (compact) {
        return <SatisfactionScores />;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SatisfactionScores />
            <SupportMetrics />
        </div>
    );
}