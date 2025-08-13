// app/administration/missions/[id]/components/MissionView.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react"; // <-- IMPORT AJOUTÉ
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mission, Order, Client, Observation, QualityCheck, Attachment, Subcontractor, Employee } from "@prisma/client";
import { saveMission, validateMission } from "../../actions";
import { ObservationCard } from "./ObservationCard";
import { QualityCheckCard } from "./QualityCheckCard";
import { AttachmentCard } from "./AttachmentCard";
import { SubcontractingCard } from "./SubcontractingCard";
import { SubcontractorAssignmentModal } from "./SubcontractorAssignmentModal";
import { CheckCircle, Edit, Loader2, ShieldCheck, X, Calendar, User, FileText, Info, Users, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

// --- Form Validation Schema for In-Place Editing ---
const missionEditSchema = z.object({
    assignedToId: z.string().min(1, "Un employé doit être assigné."),
    scheduledStart: z.any().transform(val => new Date(val)),
    scheduledEnd: z.any().transform(val => new Date(val)),
    notes: z.string().optional(),
}).refine(data => data.scheduledEnd > data.scheduledStart, {
    message: "La date de fin doit être après la date de début.",
    path: ["scheduledEnd"],
});
type MissionEditFormData = z.infer<typeof missionEditSchema>;

// --- Type Definitions for Props ---
type FullMission = Mission & {
  assignedTo: Employee | null;
  order: (Order & { client: Client; }) | null;
  observations: Observation[];
  qualityCheck: QualityCheck | null;
  attachments: Attachment[];
  subcontractor: Subcontractor | null;
};

interface MissionViewProps {
  mission: FullMission;
  allEmployees: Employee[];
  allSubcontractors: Subcontractor[];
}

// --- Helper Functions & Sub-Components ---
const formatDate = (date: Date | null) =>
  date
    ? new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(new Date(date))
    : 'N/A';

const InfoPill = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex flex-col">
    <span className="text-xs font-semibold text-gray-500 dark:text-dark-subtle flex items-center gap-1.5">
      {icon}
      {label}
    </span>
    <span className="text-sm text-gray-800 dark:text-dark-text">{value}</span>
  </div>
);

// --- Main Component ---
export function MissionView({ mission, allEmployees, allSubcontractors }: MissionViewProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<MissionEditFormData>({
    resolver: zodResolver(missionEditSchema),
    defaultValues: {
      assignedToId: mission.assignedToId || "",
      scheduledStart: mission.scheduledStart,
      scheduledEnd: mission.scheduledEnd || new Date(),
      notes: mission.notes || ""
    }
  });

  const handleValidation = async () => {
    if (!mission.order) {
      toast.error("Cette mission n'est pas liée à une commande et ne peut pas être validée.");
      return;
    }
    if (confirm("Voulez-vous approuver cette mission ? Cela générera la facture et le bon de livraison.")) {
      setIsLoading(true);
      const result = await validateMission(mission.id, mission.order.id);
      if (result && !result.success) {
        toast.error(result.error);
      } else {
        toast.success("Mission validée et documents générés !");
      }
      setIsLoading(false);
      router.refresh();
    }
  };

  const onEditSubmit = async (data: MissionEditFormData) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('id', mission.id);
    formData.append('title', mission.title || "");
    formData.append('orderId', mission.orderId || "");
    formData.append('assignedToId', data.assignedToId);
    formData.append('scheduledStart', data.scheduledStart.toISOString());
    formData.append('scheduledEnd', data.scheduledEnd.toISOString());
    formData.append('notes', data.notes || "");

    const result = await saveMission(formData);
    if (result.success) {
      toast.success("Mission mise à jour.");
      setIsEditing(false);
      router.refresh();
    } else {
      toast.error(result.message);
    }
    setIsLoading(false);
  };

  const isUserAdminOrManager = session?.user?.role === 'ADMIN' || session?.user?.role === 'MANAGER';

  const formatDateForInput = (date: Date | null | undefined): string => {
    if (!date) return '';
    const d = new Date(date);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  return (
    <>
      <div className="bg-white dark:bg-dark-container rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        {/* --- HEADER --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b dark:border-dark-border pb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-dark-text">
              {mission.order ? `Mission #${mission.order.orderNumber}` : mission.title || "Détails de la Mission"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-dark-subtle mt-1">
              {mission.order ? `Client: ${mission.order.client.nom}` : "Mission interne ou spéciale"}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
              {/* --- CORRECTION : Le bouton vérifie maintenant le rôle de l'utilisateur ET le statut 'APPROBATION' --- */}
              {isUserAdminOrManager && mission.status === 'APPROBATION' && mission.order && (
                  <button onClick={handleValidation} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50">
                      {isLoading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={16} />}
                      Approuver & Facturer
                  </button>
              )}
          </div>
        </div>

        {/* --- MAIN CONTENT GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- LEFT COLUMN --- */}
          <div className="lg:col-span-2 space-y-8">
            {/* --- Editable Details --- */}
            <div className="bg-gray-50 dark:bg-dark-surface rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">Détails & Planification</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <Edit size={14} /> Modifier
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-dark-subtle dark:hover:text-white"
                    >
                      <X size={14} /> Annuler
                    </button>
                    <button
                      onClick={handleSubmit(onEditSubmit)}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 text-sm font-medium text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <CheckCircle size={14} />} Enregistrer
                    </button>
                  </div>
                )}
              </div>
              {isEditing ? (
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 dark:text-dark-subtle">Assigné à</label>
                      <select
                        {...register("assignedToId")}
                        className="w-full p-2 mt-1 border rounded bg-white dark:bg-dark-background"
                      >
                        {allEmployees.map(emp => (
                          <option key={emp.id} value={emp.id}>
                            {emp.firstName} {emp.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 dark:text-dark-subtle">Début Planifié</label>
                      <input
                        type="datetime-local"
                        {...register("scheduledStart")}
                        defaultValue={formatDateForInput(mission.scheduledStart)}
                        className="w-full p-2 mt-1 border rounded bg-white dark:bg-dark-background"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 dark:text-dark-subtle">Fin Planifiée</label>
                      <input
                        type="datetime-local"
                        {...register("scheduledEnd")}
                        defaultValue={formatDateForInput(mission.scheduledEnd)}
                        className="w-full p-2 mt-1 border rounded bg-white dark:bg-dark-background"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-dark-subtle">Notes</label>
                    <textarea
                      {...register("notes")}
                      rows={3}
                      className="w-full p-2 mt-1 border rounded bg-white dark:bg-dark-background"
                    />
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                  <InfoPill
                    icon={<User size={14} />}
                    label="Assigné à"
                    value={mission.assignedTo ? `${mission.assignedTo.firstName} ${mission.assignedTo.lastName}` : 'N/A'}
                  />
                  <InfoPill icon={<Calendar size={14} />} label="Début Planifié" value={formatDate(mission.scheduledStart)} />
                  <InfoPill icon={<Calendar size={14} />} label="Fin Planifiée" value={formatDate(mission.scheduledEnd)} />
                  <div className="col-span-2">
                    <InfoPill icon={<FileText size={14} />} label="Notes" value={mission.notes || "Aucune note."} />
                  </div>
                </div>
              )}
            </div>

            <SubcontractingCard mission={mission} onAssign={() => setIsAssignModalOpen(true)} />
            {mission.attachments[0] && <AttachmentCard attachment={mission.attachments[0]} missionId={mission.id} />}
            {mission.qualityCheck && <QualityCheckCard qualityCheck={mission.qualityCheck} missionId={mission.id} />}
            {mission.observations.length > 0 && (
              <ObservationCard observations={mission.observations} missionId={mission.id} />
            )}
          </div>

          {/* --- RIGHT COLUMN --- */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-50 dark:bg-dark-surface rounded-lg p-4 sticky top-24">
              <h3 className="font-bold text-lg mb-4 dark:text-white">Informations Clés</h3>
              <div className="space-y-4">
                <InfoPill icon={<Info size={14} />} label="Statut Actuel" value={mission.status} />
                {mission.order && (
                  <>
                    <InfoPill icon={<Users size={14} />} label="Client" value={mission.order.client.nom} />
                    <InfoPill icon={<MapPin size={14} />} label="Adresse" value={mission.order.client.adresse || '-'} />
                  </>
                )}
              </div>
              <div className="mt-6">
                <h4 className="font-semibold text-sm mb-3 dark:text-white">Chronologie</h4>
                <ul className="space-y-4 border-l-2 border-gray-200 dark:border-dark-border ml-2">
                  <li className="ml-4">
                    <p className="text-xs text-gray-500 dark:text-dark-subtle">Début planifié: {formatDate(mission.scheduledStart)}</p>
                  </li>
                  {mission.actualStart && (
                    <li className="ml-4">
                      <p className="text-xs text-gray-500 dark:text-dark-subtle">Pointage début: {formatDate(mission.actualStart)}</p>
                    </li>
                  )}
                  {mission.actualEnd && (
                    <li className="ml-4">
                      <p className="text-xs text-gray-500 dark:text-dark-subtle">Pointage fin: {formatDate(mission.actualEnd)}</p>
                    </li>
                  )}
                  {mission.status === 'VALIDATED' && (
                    <li className="ml-4">
                      <p className="text-xs font-semibold text-green-600 dark:text-green-400">Validé & Facturé</p>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SubcontractorAssignmentModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        missionId={mission.id}
        subcontractors={allSubcontractors}
      />
    </>
  );
}