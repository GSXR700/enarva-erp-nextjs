// app/administration/missions/[id]/components/ObservationCard.tsx
"use client";

import { Observation } from "@prisma/client";
import Image from "next/image";
import { Camera, Info } from "lucide-react";

export function ObservationCard({ observation }: { observation: Observation }) {
  const formatDate = (date: Date) => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));

  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 bg-gray-200 dark:bg-dark-surface rounded-full h-10 w-10 flex items-center justify-center">
        <Info className="h-5 w-5 text-gray-600 dark:text-dark-subtle" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-800 dark:text-dark-text">{observation.content}</p>
        <p className="text-xs text-gray-500 dark:text-dark-subtle mt-1">{formatDate(observation.reportedAt)}</p>
        
        {observation.mediaUrl && (
          <a href={observation.mediaUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block">
            <Image
              src={observation.mediaUrl}
              alt="Photo d'observation"
              width={200}
              height={150}
              className="rounded-lg object-cover border dark:border-dark-border hover:opacity-90 transition-opacity"
            />
          </a>
        )}
      </div>
    </div>
  );
}