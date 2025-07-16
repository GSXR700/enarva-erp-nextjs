// components/ui/MetricCard.tsx
import React from 'react'; // Import React for React.ReactNode

interface MetricCardProps {
    title: string;
    value: string | number;
    // CORRECTION: The icon prop now accepts any valid React element (like <Euro />)
    icon: React.ReactNode; 
    description: string;
}

export default function MetricCard({ title, value, icon, description }: MetricCardProps) {
    return (
        <div className="bg-white dark:bg-dark-container rounded-lg shadow-md p-5 h-40 flex flex-col justify-between">
            <div className="flex justify-end">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                    {/* CORRECTION: We render the icon directly as it's already a component */}
                    {icon}
                </div>
            </div>
            <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
                <p className="text-2xl font-semibold mt-1">{value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
            </div>
        </div>
    );
}