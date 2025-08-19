"use client";

import { useState, useEffect } from 'react';
import { CommercialPerformanceHub } from './CommercialPerformanceHub';
import { OperationalCenter } from './OperationalCenter';
import { FinancialControl } from './FinancialControl';
import { HRProductivity } from './HRProductivity';
import { CustomerExperience } from './CustomerExperience';
import { InventoryLogistics } from './InventoryLogistics';
import { StrategicVision } from './StrategicVision';
import { QuickCommand } from './QuickCommand';

interface DashboardData {
    commercial: any;
    operational: any;
    financial: any;
    hr: any;
    customer: any;
    inventory: any;
}

export function ExecutiveDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await fetch('/api/dashboard/executive');
            const data = await response.json();
            setData(data);
        } catch (error) {
            console.error('Erreur chargement dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>;
    }

    const tabs = [
        { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
        { id: 'commercial', label: 'Commercial', icon: '💼' },
        { id: 'operations', label: 'Opérations', icon: '⚡' },
        { id: 'financial', label: 'Financier', icon: '💰' },
        { id: 'hr', label: 'RH', icon: '👥' },
        { id: 'customer', label: 'Client', icon: '😊' },
        { id: 'inventory', label: 'Logistique', icon: '📦' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                            activeTab === tab.id
                                ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2">
                        <CommercialPerformanceHub data={data?.commercial} compact />
                    </div>
                    <div>
                        <QuickCommand />
                    </div>
                    <div>
                        <OperationalCenter data={data?.operational} compact />
                    </div>
                    <div>
                        <FinancialControl data={data?.financial} compact />
                    </div>
                    <div>
                        <CustomerExperience data={data?.customer} compact />
                    </div>
                </div>
            )}

            {activeTab === 'commercial' && (
                <CommercialPerformanceHub data={data?.commercial} />
            )}

            {activeTab === 'operations' && (
                <OperationalCenter data={data?.operational} />
            )}

            {activeTab === 'financial' && (
                <FinancialControl data={data?.financial} />
            )}

            {activeTab === 'hr' && (
                <HRProductivity data={data?.hr} />
            )}

            {activeTab === 'customer' && (
                <CustomerExperience data={data?.customer} />
            )}

            {activeTab === 'inventory' && (
                <InventoryLogistics data={data?.inventory} />
            )}
        </div>
    );
}