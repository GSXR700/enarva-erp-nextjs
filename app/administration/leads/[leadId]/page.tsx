// app/administration/leads/[leadId]/page.tsx
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { LeadHeader } from "./components/LeadHeader";
import { LeadDetails } from "./components/LeadDetails";
import { LeadActivity } from "./components/LeadActivity";
import { LeadStatusManager } from "./components/LeadStatusManager";

interface LeadDetailPageProps {
  params: {
    leadId: string;
  };
}

const LeadDetailPage = async ({ params }: LeadDetailPageProps) => {
  const lead = await prisma.lead.findUnique({
    where: { id: params.leadId },
    include: {
      assignedTo: {
        select: { name: true, image: true }
      }
    },
  });

  if (!lead) {
    return notFound();
  }

  const serializableLead = JSON.parse(JSON.stringify(lead));

  return (
    <div className="space-y-6">
      <LeadHeader lead={serializableLead} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <LeadDetails lead={serializableLead} />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <LeadStatusManager lead={serializableLead} />
          <LeadActivity lead={serializableLead} />
        </div>
      </div>
    </div>
  );
};

export default LeadDetailPage;