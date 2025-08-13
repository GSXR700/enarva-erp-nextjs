// app/administration/support/components/SupportPageClient.tsx
"use client";

import { useState } from "react";
import type { TicketSAV, MaintenanceTicket, Client, Mission, Equipment, Employee } from "@prisma/client";
import { SavTicketList } from "./SavTicketList";
import { MaintenanceTicketList } from "./MaintenanceTicketList"; // Import the new component

interface SupportPageClientProps {
    initialSavTickets: any[];
    initialMaintenanceTickets: any[];
    clients: Client[];
    missions: any[];
    equipments: Equipment[];
    employees: Employee[];
}

export function SupportPageClient({
    initialSavTickets,
    initialMaintenanceTickets,
    clients,
    missions,
    equipments,
    employees
}: SupportPageClientProps) {
    const [activeTab, setActiveTab] = useState('sav');

    const tabs = [
        { id: 'sav', label: 'Tickets SAV Client' },
        { id: 'maintenance', label: 'Tickets de Maintenance' },
    ];

    return (
        <div className="bg-white dark:bg-dark-container rounded-lg shadow-md">
            <div className="border-b border-gray-200 dark:border-dark-border">
                <nav className="-mb-px flex space-x-6 px-6" aria-label="Tabs">
                {tabs.map(tab => (
                    <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                        activeTab === tab.id
                        ? 'border-primary text-primary dark:border-blue-400 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-dark-subtle dark:hover:text-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                    {tab.label}
                    </button>
                ))}
                </nav>
            </div>

            <div className="p-6">
                {activeTab === 'sav' && (
                    <SavTicketList
                        tickets={initialSavTickets}
                        clients={clients}
                        missions={missions}
                    />
                )}
                {activeTab === 'maintenance' && (
                    <MaintenanceTicketList
                        tickets={initialMaintenanceTickets}
                        equipments={equipments}
                        employees={employees}
                    />
                )}
            </div>
        </div>
    );
}