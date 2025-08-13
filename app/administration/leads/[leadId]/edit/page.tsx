// app/administration/leads/[leadId]/edit/page.tsx
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getLeadFormData } from "../../actions";
import { EditLeadClientPage } from "./EditLeadClientPage"; // We will create this new component

interface EditLeadPageProps {
    params: {
        leadId: string;
    }
}

// This is now an async Server Component
const EditLeadPage = async ({ params }: EditLeadPageProps) => {

    // Fetch all necessary data in parallel for efficiency
    const [lead, { users, subcontractors }] = await Promise.all([
        prisma.lead.findUnique({
            where: { id: params.leadId }
        }),
        getLeadFormData() // Fetches users and subcontractors
    ]);

    if (!lead) {
        return notFound();
    }

    return (
        // Pass all fetched data to the new Client Component
        <EditLeadClientPage
            lead={lead}
            users={users}
            subcontractors={subcontractors}
        />
    );
}

export default EditLeadPage;