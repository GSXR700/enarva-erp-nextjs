// app/administration/invoices/[id]/page.tsx
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { InvoiceView } from "./components/InvoiceView";

export default async function InvoiceDetailsPage({ params }: { params: { id: string } }) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      order: {
        include: {
            quote: true
        }
      },
    },
  });

  const companyInfo = await prisma.companyInfo.findFirst();

  if (!invoice || !companyInfo) {
    notFound();
  }

  return <InvoiceView invoice={invoice} companyInfo={companyInfo} />;
}