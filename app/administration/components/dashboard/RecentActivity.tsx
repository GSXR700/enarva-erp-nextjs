// app/administration/components/dashboard/RecentActivity.tsx
"use client";
// Ce composant utilisera des données factices pour le moment.
// Vous pouvez le connecter à une API plus tard.

import { CheckCircle, Clock, FileText } from 'lucide-react';

const activities = [
    { icon: <CheckCircle size={16} className="text-green-500"/>, text: "La mission #CMD-102/2025 a été validée.", time: "Il y a 5 min" },
    { icon: <FileText size={16} className="text-blue-500"/>, text: "Nouveau devis DV-101/2025 créé pour Mme Ibtissame.", time: "Il y a 1 heure" },
    { icon: <Clock size={16} className="text-yellow-500"/>, text: "Le statut du prospect 'Dyla WSP' est passé à 'Qualifié'.", time: "Il y a 3 heures" },
];

export function RecentActivity() {
    return (
        <div className="bg-white dark:bg-dark-container p-6 rounded-2xl shadow-md h-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Activité Récente</h3>
            <ul className="space-y-4">
                {activities.map((activity, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">{activity.icon}</div>
                        <div>
                            <p className="text-sm text-gray-800 dark:text-dark-text">{activity.text}</p>
                            <p className="text-xs text-gray-400 dark:text-dark-subtle">{activity.time}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}