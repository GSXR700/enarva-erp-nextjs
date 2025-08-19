"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Zap, Plus, Phone, Settings, AlertTriangle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export function QuickCommand() {
    const quickActions = [
        { 
            label: 'Nouveau Devis', 
            href: '/administration/quotes/new', 
            icon: <Plus className="h-4 w-4" />,
            color: 'bg-blue-500 hover:bg-blue-600'
        },
        { 
            label: 'Mission Urgente', 
            href: '/administration/missions/new', 
            icon: <Zap className="h-4 w-4" />,
            color: 'bg-red-500 hover:bg-red-600'
        },
        { 
            label: 'Appel Client', 
            href: '/administration/clients', 
            icon: <Phone className="h-4 w-4" />,
            color: 'bg-green-500 hover:bg-green-600'
        },
        { 
            label: 'Paramètres', 
            href: '/administration/settings', 
            icon: <Settings className="h-4 w-4" />,
            color: 'bg-gray-500 hover:bg-gray-600'
        }
    ];

    const urgentAlerts = [
        { type: 'warning', message: '3 factures en retard', count: 3 },
        { type: 'info', message: '2 missions à valider', count: 2 },
        { type: 'success', message: '5 missions complétées', count: 5 }
    ];

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Actions Rapides
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                        {quickActions.map((action, index) => (
                            <Link
                                key={index}
                                href={action.href}
                                className={`flex items-center justify-center gap-2 p-3 rounded-lg text-white text-sm font-medium transition-colors ${action.color}`}
                            >
                                {action.icon}
                                <span className="hidden sm:inline">{action.label}</span>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Alertes Urgentes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {urgentAlerts.map((alert, index) => (
                            <div key={index} className={`flex items-center justify-between p-2 rounded ${
                                alert.type === 'warning' ? 'bg-yellow-50 text-yellow-800' :
                                alert.type === 'info' ? 'bg-blue-50 text-blue-800' :
                                'bg-green-50 text-green-800'
                            }`}>
                                <span className="text-sm">{alert.message}</span>
                                <span className="text-xs font-bold">{alert.count}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}