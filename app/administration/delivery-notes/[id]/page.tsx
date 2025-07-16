import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { DeliveryNoteView } from "./components/DeliveryNoteView";

export default async function DeliveryNoteDetailsPage({ params }: { params: { id: string } }) {
  const deliveryNote = await prisma.deliveryNote.findUnique({
    where: { id: params.id },
    include: {
      order: {
        include: {
          client: true,
          quote: {
            select: {
              id: true,
              quoteNumber: true
            }
          }
        },
      },
    },
  });

  const companyInfo = await prisma.companyInfo.findFirst();

  if (!deliveryNote || !companyInfo) {
    notFound();
  }

  return <DeliveryNoteView deliveryNote={deliveryNote} companyInfo={companyInfo} />;
}