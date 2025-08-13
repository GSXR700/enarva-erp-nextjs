// app/administration/missions/[id]/components/AttachmentCard.tsx
"use client";

import type { Attachment } from "@prisma/client";
import Image from "next/image";
import { PlusCircle, Trash2 } from "lucide-react";
import { deleteAttachment } from "../../actions";
import { toast } from "sonner";

export function AttachmentCard({ attachment, missionId }: { attachment?: Attachment, missionId: string }) {

  const handleDelete = async () => {
    if (attachment && confirm("Êtes-vous sûr de vouloir supprimer cet attachement ?")) {
        const result = await deleteAttachment(attachment.id);
        if (result.success) {
            toast.success("Attachement supprimé.");
        } else {
            toast.error(result.error);
        }
    }
  }

  return (
    <div>
        <h2 className="text-xl font-bold mb-4 dark:text-white">Attachement de Validation</h2>
        <div className="bg-white dark:bg-dark-container rounded-lg shadow-lg p-6">
            {attachment ? (
                <>
                    <div className="flex justify-end -mt-2 -mr-2">
                        <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-500 rounded-full"><Trash2 size={16}/></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 -mt-4">
                        <div>
                            <h3 className="font-semibold text-base dark:text-dark-subtle mb-2">Signature Superviseur</h3>
                            <div className="bg-gray-100 dark:bg-dark-surface rounded-md p-2 border dark:border-dark-border">
                                <Image src={attachment.supervisorSignatureUrl!} alt="Signature superviseur" width={250} height={100} objectFit="contain" className="mx-auto" />
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-base dark:text-dark-subtle mb-2">Signature Client</h3>
                            <div className="bg-gray-100 dark:bg-dark-surface rounded-md p-2 border dark:border-dark-border">
                                <Image src={attachment.clientSignatureUrl!} alt="Signature client" width={250} height={100} objectFit="contain" className="mx-auto" />
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-center text-gray-400 mt-4">Validé le {new Date(attachment.validatedAt).toLocaleString('fr-FR')}</p>
                </>
            ) : (
                <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-dark-subtle mb-4">Aucun attachement de validation n'a été soumis pour cette mission.</p>
                    <button className="flex items-center gap-2 mx-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                        <PlusCircle size={16} /> Ajouter un Attachement
                    </button>
                </div>
            )}
        </div>
    </div>
  );
}