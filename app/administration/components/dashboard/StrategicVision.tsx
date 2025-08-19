"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Target, Lightbulb } from 'lucide-react';

interface StrategicVisionProps {
    data?: any;
}

export function StrategicVision({ data }: StrategicVisionProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        KPIs Stratégiques
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Objectif Revenu</span>
                            <span className="font-bold text-green-600">87%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Satisfaction Client</span>
                            <span className="font-bold text-blue-600">94%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Efficacité Opérationnelle</span>
                            <span className="font-bold text-purple-600">89%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Croissance Équipe</span>
                            <span className="font-bold text-orange-600">+12%</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        Recommandations IA
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="text-sm font-medium text-blue-800">
                                Optimiser planning WhatsApp
                            </div>
                            <div className="text-xs text-blue-600">
                                +15% conversion estimée
                            </div>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <div className="text-sm font-medium text-green-800">
                                Cibler clients inactifs
                            </div>
                            <div className="text-xs text-green-600">
                                +8% réactivation possible
                            </div>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <div className="text-sm font-medium text-purple-800">
                                Formation équipe technique
                            </div>
                            <div className="text-xs text-purple-600">
                                +20% efficacité prévue
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}