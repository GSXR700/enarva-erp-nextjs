// app/administration/components/dashboard/MetricCard.tsx
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: React.ReactElement<LucideIcon>;
    color: 'blue' | 'green' | 'yellow' | 'purple';
}

export function MetricCard({ title, value, icon, color }: MetricCardProps) {
    const colorClasses = {
        blue: "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400",
        green: "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400",
        yellow: "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400",
        purple: "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400",
    };

    return (
        <div className="bg-white dark:bg-dark-container p-5 rounded-2xl shadow-md flex items-center gap-5">
            <div className={cn("p-4 rounded-full", colorClasses[color])}>
                {icon}
            </div>
            <div className="flex flex-col">
                <p className="text-sm font-medium text-gray-500 dark:text-dark-subtle">{title}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
    );
}