// app/administration/missions/components/MissionsPageClient.tsx
"use client";

import { useState } from 'react';
import { MissionList } from "./MissionList";
import { PaginationControls } from "../../components/PaginationControls";
import { MissionFormModal } from '../../components/modals/MissionFormModal';
import { AddMissionButton } from "./AddMissionButton";
import type { Mission, Order, Employee, Client } from "@prisma/client";
import { MissionWithDetails } from "../page";

type OrderWithClient = Order & { client: Client };

interface MissionsPageClientProps {
  missions: MissionWithDetails[];
  totalMissions: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  itemsPerPage: number;
  allOrders: OrderWithClient[]; // Ensure this type matches the fetched data
  allEmployees: Employee[];
}

export function MissionsPageClient({
  missions,
  totalMissions,
  hasNextPage,
  hasPrevPage,
  itemsPerPage,
  allOrders,
  allEmployees
}: MissionsPageClientProps) {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  const handleOpenModal = (mission: Mission | null = null) => {
    setSelectedMission(mission);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMission(null);
  };

  return (
    <>
      <MissionFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mission={selectedMission}
        allOrders={allOrders}
        allEmployees={allEmployees}
      />

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">
          Gestion des Missions
        </h1>
        <AddMissionButton onClick={() => handleOpenModal()} />
      </div>

      <div className="bg-white dark:bg-dark-container rounded-lg shadow-md">
        <MissionList missions={missions} onEdit={handleOpenModal} />
        <PaginationControls
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          totalItems={totalMissions}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </>
  );
};