"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Package, Wrench } from 'lucide-react';

interface InventoryLogisticsProps {
    data: any;
    compact?: boolean;
}

export function InventoryLogistics({ data, compact = false }: InventoryLogisticsProps) {
    if (!data) return <div>Chargement des données logistiques...</div>;

    const InventoryStatus = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    État Inventaire
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                            {data.inventory.value.totalValue.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Valeur Stock (MAD)</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                            {data.inventory.value.turnoverRate}
                        </div>
                        <div className="text-sm text-gray-600">Rotation/An</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const MaintenanceStatus = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Maintenance Équipements
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Coût Mensuel</span>
                        <span className="font-bold text-orange-600">
                            {data.equipment.maintenance.cost.thisMonth.toLocaleString()} MAD
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    if (compact) {
        return <InventoryStatus />;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InventoryStatus />
            <MaintenanceStatus />
        </div>
    );
}