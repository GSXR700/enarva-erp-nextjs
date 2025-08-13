// app/administration/missions/[id]/page.tsx
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MissionView } from "./components/MissionView";

// Ceci est un composant serveur asynchrone pour récupérer les données
export default async function MissionDetailsPage({ params }: { params: { id: string } }) {

  // Récupérer toutes les données nécessaires en parallèle pour plus d'efficacité
  const [mission, employees, subcontractors] = await Promise.all([
    prisma.mission.findUnique({
      where: { id: params.id },
      include: {
        order: {
          include: {
            client: true,
          },
        },
        assignedTo: true, // Récupérer l'objet employé complet
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
        subcontractor: true,
      },
    }),
    prisma.employee.findMany({ // Récupérer tous les employés pour le menu déroulant de modification
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }]
    }),
    prisma.subcontractor.findMany({ orderBy: { name: 'asc' }}) // Récupérer tous les sous-traitants
  ]);

  if (!mission) {
    return notFound();
  }

  // Transmettre toutes les données récupérées au nouveau composant client
  return <MissionView mission={mission} allEmployees={employees} allSubcontractors={subcontractors} />;
}