// app/administration/leads/[leadId]/edit/page.tsx

import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { LeadForm } from "../../components/LeadForm";

interface EditLeadPageProps {
    params: {
        leadId: string;
    }
}

const EditLeadPage = async ({ params }: EditLeadPageProps) => {

    const lead = await prisma.lead.findUnique({
        where: {
            id: params.leadId,
        }
    });

    if (!lead) {
        return notFound();
    }

    return (
        <div className="p-4 md:p-6 bg-white dark:bg-dark-surface rounded-lg shadow-sm">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Modifier le Prospect</h1>
                <p className="text-sm text-gray-500 dark:text-dark-subtle">Mettez à jour les informations de "{lead.nom}".</p>
            </div>

            {/* Le formulaire est un composant client. 
              En passant les données ici, on bénéficie du rendu serveur pour la récupération initiale.
            */}
            <LeadForm 
                initialData={JSON.parse(JSON.stringify(lead))} 
                onFormSubmit={() => {
                    // La redirection sera gérée côté client après la soumission
                }} 
            />
        </div>
    );
}

export default EditLeadPage;