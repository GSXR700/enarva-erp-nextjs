"use client";

import type { Attachment } from "@prisma/client";
import Image from "next/image";

export function AttachmentCard({ attachment }: { attachment: Attachment }) {
  return (
    <div className="bg-white dark:bg-dark-container rounded-lg shadow-md p-6">
      <h3 className="font-bold text-lg mb-4 dark:text-white">Attachement de Validation</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-sm dark:text-dark-subtle mb-2">Signature Superviseur</h4>
          <div className="bg-gray-100 dark:bg-dark-surface rounded-md p-2 border dark:border-dark-border">
            <Image
              src={attachment.supervisorSignatureUrl!}
              alt="Signature superviseur"
              width={250}
              height={100}
              className="mx-auto"
            />
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-sm dark:text-dark-subtle mb-2">Signature Client</h4>
          <div className="bg-gray-100 dark:bg-dark-surface rounded-md p-2 border dark:border-dark-border">
            <Image
              src={attachment.clientSignatureUrl!}
              alt="Signature client"
              width={250}
              height={100}
              className="mx-auto"
            />
          </div>
        </div>
      </div>
      <p className="text-xs text-center text-gray-400 mt-4">
        Validé le {new Date(attachment.validatedAt).toLocaleString('fr-FR')}
      </p>
    </div>
  );
}