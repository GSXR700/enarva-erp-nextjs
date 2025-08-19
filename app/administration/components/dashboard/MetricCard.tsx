// app/administration/components/dashboard/MetricCard.tsx
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactElement<LucideIcon>;
    color: 'blue' | 'green' | 'yellow' | 'purple' | 'indigo' | 'emerald';
    className?: string;
}

export function MetricCard({ title, value, subtitle, icon, color, className }: MetricCardProps) {
    const colorClasses = {
        blue: "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400",
        green: "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400",
        yellow: "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400",
        purple: "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400",
        indigo: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400",
        emerald: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400",
    };

    return (
        <div className={cn(
            "bg-white dark:bg-dark-container p-4 sm:p-5 rounded-2xl shadow-md flex items-center gap-4",
            className
        )}>
            <div className={cn("p-3 rounded-full", colorClasses[color])}>
                {icon}
            </div>
            <div className="flex flex-col">
                <p className="text-sm font-medium text-gray-500 dark:text-dark-subtle">{title}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
                {subtitle && (
                    <p className="text-xs text-gray-400 dark:text-dark-subtle mt-1">{subtitle}</p>
                )}
            </div>
        </div>
    );
}