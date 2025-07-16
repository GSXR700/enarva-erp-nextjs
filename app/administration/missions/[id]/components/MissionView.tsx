// app/administration/missions/[id]/components/MissionView.tsx
"use client";

import { useState } from "react";
import { Mission, Order, Client, Observation, QualityCheck, Attachment, Subcontractor } from "@prisma/client";
import { validateMission } from "../actions";
import { ObservationCard } from "./ObservationCard";
import { QualityCheckCard } from "./QualityCheckCard";
import { AttachmentCard } from "./AttachmentCard";
import { SubcontractingCard } from "./SubcontractingCard";
import { SubcontractorAssignmentModal } from "./SubcontractorAssignmentModal";
import { CheckCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

// FIX: The 'order' property is now optional to support missions without a linked order.
type FullMission = Mission & {
  assignedTo: { firstName: string; lastName: string; };
  order: (Order & { client: Client; }) | null; // <-- This is now correctly typed as optional.
  observations: Observation[];
  qualityCheck: QualityCheck | null;
  attachments: Attachment[];
  subcontractor: Subcontractor | null;
};

interface MissionViewProps {
  mission: FullMission;
  subcontractors: Subcontractor[];
}

export function MissionView({ mission, subcontractors }: MissionViewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const router = useRouter();
  const formatDate = (date: Date | null) => date ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(date)) : 'N/A';

  const handleValidate = async () => {
    // FIX: A check is added to ensure an order exists before validation.
    if (!mission.order) {
        alert("This mission is not linked to an order and cannot be validated.");
        return;
    }
    if (confirm("Do you really want to validate this mission? This will generate the invoice and the delivery note.")) {
        setIsLoading(true);
        const result = await validateMission(mission.id, mission.order.id);
        if (result && !result.success) {
            alert(result.error);
        }
        setIsLoading(false);
        router.refresh();
    }
  };

  return (
    <>
      <div>
        <div className="flex justify-between items-start mb-8">
          <div>
            {/* FIX: Displays the mission title as a fallback when no order is present. */}
            <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">
              {mission.order ? `Mission (Order ${mission.order.orderNumber})` : mission.title}
            </h1>
            {mission.order && <p className="text-gray-500 dark:text-dark-subtle mt-1">Client: {mission.order.client.name}</p>}
          </div>
          <div className="flex items-center gap-2">
              {/* FIX: The validation button is only rendered for missions linked to an order. */}
              {mission.status === 'COMPLETED' && mission.order && (
                  <button
                      onClick={handleValidate}
                      disabled={isLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                  >
                      {isLoading ? <Loader2 className="animate-spin" /> : <CheckCircle size={16} />}
                      Validate Mission
                  </button>
              )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-dark-container rounded-lg shadow-md p-6">
              <h3 className="font-bold text-lg mb-4 dark:text-white">Intervention Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 dark:text-dark-text">
                  <p><strong className="text-gray-500 dark:text-dark-subtle">Scheduled Start:</strong><br/>{formatDate(mission.scheduledStart)}</p>
                  <p><strong className="text-gray-500 dark:text-dark-subtle">Scheduled End:</strong><br/>{formatDate(mission.scheduledEnd)}</p>
                  <p><strong className="text-gray-500 dark:text-dark-subtle">Clock In:</strong><br/>{formatDate(mission.actualStart)}</p>
                  <p><strong className="text-gray-500 dark:text-dark-subtle">Clock Out:</strong><br/>{formatDate(mission.actualEnd)}</p>
              </div>
            </div>
            
            <SubcontractingCard mission={mission} onAssign={() => setIsAssignModalOpen(true)} />

            {mission.attachments.length > 0 && <AttachmentCard attachment={mission.attachments[0]} />}
            {mission.qualityCheck && <QualityCheckCard qualityCheck={mission.qualityCheck} />}

            <div className="bg-white dark:bg-dark-container rounded-lg shadow-md p-6">
               <h3 className="font-bold text-lg mb-4 dark:text-white">Field Observations</h3>
               <div className="space-y-6">
                  {mission.observations.length > 0 ? (
                      mission.observations.map(obs => <ObservationCard key={obs.id} observation={obs} />)
                  ) : (
                      <p className="text-sm text-gray-500 dark:text-dark-subtle">No observations for this mission.</p>
                  )}
               </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-dark-container rounded-lg shadow-md p-6">
              <h3 className="font-bold text-lg mb-4 dark:text-white">Key Information</h3>
              <div className="space-y-3 text-sm text-gray-700 dark:text-dark-text">
                  <p><strong className="text-gray-500 dark:text-dark-subtle">Status:</strong> {mission.status}</p>
                  <p><strong className="text-gray-500 dark:text-dark-subtle">Assigned to:</strong> {`${mission.assignedTo.firstName} ${mission.assignedTo.lastName}`}</p>
                  {/* FIX: Client information is now rendered conditionally. */}
                  {mission.order && (
                    <>
                      <p><strong className="text-gray-500 dark:text-dark-subtle">Client:</strong> {mission.order.client.name}</p>
                      <p><strong className="text-gray-500 dark:text-dark-subtle">Address:</strong> {mission.order.client.address || '-'}</p>
                    </>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <SubcontractorAssignmentModal 
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        missionId={mission.id}
        subcontractors={subcontractors}
      />
    </>
  );
}