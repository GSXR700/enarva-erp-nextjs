// enarva-nextjs-app/app/administration/missions/[id]/page.tsx
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MissionView } from "./components/MissionView";

export default async function MissionDetailsPage({ params }: { params: { id: string } }) {
  // On récupère la mission ET la liste de tous les sous-traitants en parallèle
  const [mission, subcontractors] = await Promise.all([
    prisma.mission.findUnique({
      where: { id: params.id },
      include: {
        order: {
          include: {
            client: true,
          },
        },
        assignedTo: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        observations: {
          orderBy: {
            reportedAt: 'desc',
          },
        },
        qualityCheck: true,
        attachments: {
          orderBy: {
            validatedAt: 'desc'
          }
        },
        subcontractor: true, // Inclure le sous-traitant déjà assigné
      },
    }),
    prisma.subcontractor.findMany({ orderBy: { name: 'asc' }}) // Récupérer tous les partenaires
  ]);

  if (!mission) {
    notFound();
  }

  // On passe les deux listes de données au composant client
  return <MissionView mission={mission} subcontractors={subcontractors} />;
}