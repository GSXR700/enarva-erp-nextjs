"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { TrendingUp, Users, Target, ArrowUp, ArrowDown } from 'lucide-react';

interface CommercialPerformanceHubProps {
    data: any;
    compact?: boolean;
}

export function CommercialPerformanceHub({ data, compact = false }: CommercialPerformanceHubProps) {
    if (!data) return <div>Chargement des données commerciales...</div>;

    const ConversionFunnel = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Entonnoir de Conversion
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {Object.entries(data.leadIntelligence.conversionFunnel).map(([stage, count]) => (
                        <div key={stage} className="flex items-center justify-between">
                            <span className="text-sm font-medium capitalize">{stage.replace(/([A-Z])/g, ' $1')}</span>
                            <div className="flex items-center gap-2">
                                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                    {count as number}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );

    const LeadSources = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Sources de Prospects
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                            {data.leadIntelligence.sources.whatsapp.count}
                        </div>
                        <div className="text-sm text-gray-600">WhatsApp</div>
                        <div className="text-xs text-green-600 flex items-center justify-center gap-1">
                            <ArrowUp className="h-3 w-3" />
                            {data.leadIntelligence.sources.whatsapp.trend}%
                        </div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                            {data.leadIntelligence.sources.facebook.count}
                        </div>
                        <div className="text-sm text-gray-600">Facebook</div>
                        <div className="text-xs text-blue-600">
                            {data.leadIntelligence.sources.facebook.conversion}% conv.
                        </div>
                    </div>
                    {!compact && (
                        <>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">
                                    {data.leadIntelligence.sources.instagram.count}
                                </div>
                                <div className="text-sm text-gray-600">Instagram</div>
                            </div>
                            <div className="text-center p-4 bg-orange-50 rounded-lg">
                                <div className="text-2xl font-bold text-orange-600">
                                    {data.leadIntelligence.sources.website.count}
                                </div>
                                <div className="text-sm text-gray-600">Site Web</div>
                            </div>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    const TopClients = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Top Clients
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {data.topClients.slice(0, compact ? 3 : 10).map((client: any) => (
                        <div key={client.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                            <div>
                                <div className="font-medium">{client.name}</div>
                                <div className="text-sm text-gray-500">{client.type}</div>
                            </div>
                            <div className="text-right">
                                <div className="font-medium">{client.ltv.toLocaleString()} MAD</div>
                                <div className={`text-xs px-2 py-1 rounded ${
                                    client.riskScore < 30 ? 'bg-green-100 text-green-800' :
                                    client.riskScore < 70 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    Risque: {client.riskScore}%
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );

    if (compact) {
        return (
            <div className="space-y-4">
                <LeadSources />
                <ConversionFunnel />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <LeadSources />
            <ConversionFunnel />
            <TopClients />
        </div>
    );
}