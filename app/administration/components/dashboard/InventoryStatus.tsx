// app/administration/components/dashboard/InventoryStatus.tsx
import Link from "next/link";
import { AlertTriangle, Package, ArrowRight } from "lucide-react";

interface InventoryAlert {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
  unit?: string | null;
}

interface InventoryStatusProps {
  alerts: InventoryAlert[];
  viewAllLink: string;
}

export function InventoryStatus({ alerts, viewAllLink }: InventoryStatusProps) {
  const getStockLevel = (quantity: number, minQuantity: number) => {
    const percentage = (quantity / minQuantity) * 100;
    if (percentage <= 25) return { color: 'red', label: 'Critique' };
    if (percentage <= 50) return { color: 'orange', label: 'Bas' };
    return { color: 'yellow', label: 'Attention' };
  };

  return (
    <div className="bg-white dark:bg-dark-container p-4 sm:p-6 rounded-2xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-orange-600 dark:text-orange-400" size={20} />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Alertes Stock</h3>
        </div>
        <Link href={viewAllLink} className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
          Inventaire <ArrowRight size={14} />
        </Link>
      </div>

      <div className="space-y-3">
        {alerts.map(item => {
          const stockLevel = getStockLevel(item.quantity, item.minQuantity);
          return (
            <Link
              key={item.id}
              href={`${viewAllLink}/${item.id}`}
              className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Package size={16} className="text-orange-600 dark:text-orange-400" />
                <div>
                  <p className="font-semibold text-gray-800 dark:text-dark-text">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-dark-subtle">
                    Stock minimum: {item.minQuantity} {item.unit}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-orange-600 dark:text-orange-400">
                  {item.quantity}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full
                  ${stockLevel.color === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' : ''}
                  ${stockLevel.color === 'orange' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300' : ''}
                  ${stockLevel.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' : ''}`}
                >
                  {stockLevel.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}