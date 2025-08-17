// app/administration/missions/[id]/components/QualityCheckCard.tsx
"use client";

import type { QualityCheck } from "@prisma/client";
import Image from "next/image";
import { Check, X, Star, PlusCircle, Trash2, Edit } from "lucide-react";
import { deleteQualityCheck } from "../../actions";
import { toast } from "sonner";

interface QualityCheckCardProps {
  qualityCheck: QualityCheck | null;
  missionId: string;
}

export function QualityCheckCard({ qualityCheck, missionId }: QualityCheckCardProps) {

  const handleDelete = async () => {
    if (qualityCheck && confirm("Êtes-vous sûr de vouloir supprimer ce rapport qualité ?")) {
        const result = await deleteQualityCheck(qualityCheck.id);
        if (result.success) {
            toast.success("Rapport qualité supprimé.");
        } else {
            toast.error(result.error);
        }
    }
  }
  
  // Analyse sécurisée du JSON de la checklist, avec un objet vide par défaut
  const checklistItems = qualityCheck?.checklist ? JSON.parse(qualityCheck.checklist as string) : {};

  return (
    <div>
        <h2 className="text-xl font-bold mb-4 dark:text-white">Rapport Qualité</h2>
        <div className="bg-white dark:bg-dark-container rounded-lg shadow-lg p-6">
            {qualityCheck ? (
                <>
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2 text-lg font-bold text-yellow-500">
                            <Star size={20} className="fill-current" />
                            <span>{qualityCheck.score}/100</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <button onClick={() => {/* TODO: Logique pour ouvrir le modal de modification */}} className="p-2 text-gray-400 hover:text-blue-500 rounded-full" aria-label="Modifier le rapport qualité">
                                <Edit size={16}/>
                             </button>
                             <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-500 rounded-full" aria-label="Supprimer le rapport qualité">
                                <Trash2 size={16}/>
                             </button>
                        </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                        <h3 className="font-semibold text-base dark:text-dark-subtle">Checklist de Validation</h3>
                        <ul className="list-inside space-y-1 text-sm">
                        {Object.entries(checklistItems).map(([key, value]) => (
                            <li key={key} className="flex items-center">
                            {value ? (
                                <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                            ) : (
                                <X size={16} className="text-red-500 mr-2 flex-shrink-0" />
                            )}
                            <span className="dark:text-dark-text">{key}</span>
                            </li>
                        ))}
                        </ul>
                    </div>

                    {qualityCheck.photosUrls.length > 0 && (
                        <div className="mb-4">
                        <h3 className="font-semibold text-base dark:text-dark-subtle mb-2">Photos de Preuve</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {qualityCheck.photosUrls.map((url, index) => (
                            <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="relative aspect-square">
                                <Image src={url} alt={`Photo de contrôle ${index + 1}`} layout="fill" objectFit="cover" className="rounded-md border dark:border-dark-border hover:opacity-90"/>
                            </a>
                            ))}
                        </div>
                        </div>
                    )}

                    {qualityCheck.clientSignatureUrl && (
                        <div>
                        <h3 className="font-semibold text-base dark:text-dark-subtle mb-2">Signature du Client</h3>
                        <div className="bg-gray-100 dark:bg-dark-surface rounded-md p-2 border dark:border-dark-border inline-block">
                            <Image src={qualityCheck.clientSignatureUrl} alt="Signature client" width={250} height={100} objectFit="contain"/>
                        </div>
                        </div>
                    )}
                </>
            ) : (
                 <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-dark-subtle mb-4">Aucun rapport qualité n'a été soumis pour cette mission.</p>
                    <button className="flex items-center gap-2 mx-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                        <PlusCircle size={16} /> Ajouter un Rapport
                    </button>
                </div>
            )}
        </div>
    </div>
  );
}