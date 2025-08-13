// app/administration/components/dashboard/ActivityFeed.tsx
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, Check, DollarSign } from 'lucide-react';

interface Activity {
    id: string;
    type: 'DEVIS ACCEPTÉ' | 'MISSION TERMINÉE' | 'FACTURE PAYÉE';
    description: string;
    date: string | Date | null;
    link: string;
}

const ActivityIcon = ({ type }: { type: Activity['type'] }) => {
    switch (type) {
        case 'DEVIS ACCEPTÉ':
            return <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center"><Award className="h-4 w-4 text-purple-600 dark:text-purple-400" /></div>;
        case 'MISSION TERMINÉE':
            return <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center"><Check className="h-4 w-4 text-blue-600 dark:text-blue-400" /></div>;
        case 'FACTURE PAYÉE':
            return <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center"><DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" /></div>;
        default:
            return null;
    }
};

const formatTimeAgo = (date: Date | string | null): string => {
    if (!date) return '';
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `il y a ${Math.floor(interval)} an(s)`;
    interval = seconds / 2592000;
    if (interval > 1) return `il y a ${Math.floor(interval)} mois`;
    interval = seconds / 86400;
    if (interval > 1) return `il y a ${Math.floor(interval)} jour(s)`;
    interval = seconds / 3600;
    if (interval > 1) return `il y a ${Math.floor(interval)} heure(s)`;
    interval = seconds / 60;
    if (interval > 1) return `il y a ${Math.floor(interval)} minute(s)`;
    return 'à l\'instant';
};


export function ActivityFeed() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const res = await fetch('/api/dashboard/activity');
                const data = await res.json();
                setActivities(data);
            } catch (error) {
                console.error("Failed to fetch activity feed", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchActivities();
    }, []);

    if (isLoading) {
        return (
             <div className="bg-white dark:bg-dark-container rounded-lg shadow-md p-6">
                <div className="h-6 w-1/3 bg-gray-200 dark:bg-dark-surface rounded-md mb-4 animate-pulse"></div>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-200 dark:bg-dark-surface rounded-md animate-pulse"></div>)}
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-dark-container rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text mb-4">
                Activité Récente
            </h3>
            <ul className="space-y-4">
                {activities.map(activity => (
                    <li key={activity.id}>
                        <Link href={activity.link} className="flex items-center gap-3 group">
                           <ActivityIcon type={activity.type} />
                           <div className="flex-1">
                               <p className="text-sm text-gray-800 dark:text-dark-text group-hover:text-primary transition-colors">{activity.description}</p>
                               <p className="text-xs text-gray-400 dark:text-dark-subtle">{formatTimeAgo(activity.date)}</p>
                           </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}