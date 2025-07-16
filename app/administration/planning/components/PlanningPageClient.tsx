// app/administration/planning/components/PlanningPageClient.tsx
"use client";

import { useState } from 'react';
import { CalendarView } from "./CalendarView";
import { MissionFormModal } from '../../components/modals/MissionFormModal';
import { AddMissionButton } from '../../missions/components/AddMissionButton';
import type { Order, Employee } from '@prisma/client';
import { Plus } from 'lucide-react';

// Interface pour les props reçues du composant serveur
interface PlanningPageClientProps {
    initialEvents: any[]; // Le type 'any' est utilisé ici pour correspondre à ce que FullCalendar attend
    allOrders: Order[];
    allEmployees: Employee[];
}

export function PlanningPageClient({ 
    initialEvents, 
    allOrders, 
    allEmployees 
}: PlanningPageClientProps) {
    
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fonction pour ouvrir le modal de création
    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    // Fonction pour fermer le modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="h-full flex flex-col">
            {/* Le modal est prêt à être affiché, mais invisible par défaut */}
            <MissionFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                allOrders={allOrders}
                allEmployees={allEmployees}
            />

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">
                  Planning des Missions
                </h1>
                {/* Le bouton qui appelle notre fonction pour ouvrir le modal */}
                <button 
                    onClick={handleOpenModal}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Mission
                </button>
            </div>

            <div className="flex-grow bg-white dark:bg-dark-container rounded-lg shadow-md p-4">
                 <CalendarView initialEvents={initialEvents} />
            </div>
        </div>
    );
}