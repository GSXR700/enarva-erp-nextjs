// app/administration/missions/[id]/components/QualityCheckCard.tsx
"use client";

import type { QualityCheck } from "@prisma/client";
import Image from "next/image";
import { Check, X, Star } from "lucide-react";

export function QualityCheckCard({ qualityCheck }: { qualityCheck: QualityCheck }) {
  // La checklist est stockée en JSON, nous devons la parser.
  const checklistItems = qualityCheck.checklist ? JSON.parse(qualityCheck.checklist as string) : {};

  return (
    <div className="bg-white dark:bg-dark-container rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg dark:text-white">Rapport Qualité</h3>
        <div className="flex items-center gap-2 text-lg font-bold text-yellow-500">
          <Star size={20} className="fill-current" />
          <span>{qualityCheck.score}/100</span>
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-2 mb-4">
        <h4 className="font-semibold text-sm dark:text-dark-subtle">Checklist</h4>
        <ul className="list-inside space-y-1 text-sm">
          {Object.entries(checklistItems).map(([key, value]) => (
            <li key={key} className="flex items-center">
              {value ? (
                <Check size={16} className="text-green-500 mr-2" />
              ) : (
                <X size={16} className="text-red-500 mr-2" />
              )}
              <span className="dark:text-dark-text">{key}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Photos */}
      {qualityCheck.photosUrls.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-sm dark:text-dark-subtle mb-2">Photos</h4>
          <div className="grid grid-cols-3 gap-2">
            {qualityCheck.photosUrls.map((url, index) => (
              <a key={index} href={url} target="_blank" rel="noopener noreferrer">
                <Image
                  src={url}
                  alt={`Photo de contrôle ${index + 1}`}
                  width={150}
                  height={100}
                  className="rounded-md object-cover border dark:border-dark-border hover:opacity-90"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Signature */}
      {qualityCheck.clientSignatureUrl && (
        <div>
          <h4 className="font-semibold text-sm dark:text-dark-subtle mb-2">Signature du Client</h4>
          <div className="bg-gray-100 dark:bg-dark-surface rounded-md p-2 border dark:border-dark-border">
            <Image
              src={qualityCheck.clientSignatureUrl}
              alt="Signature client"
              width={250}
              height={100}
              className="mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}