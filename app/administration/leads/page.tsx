// app/administration/leads/page.tsx
import { getLeads, getLeadFormData } from "./actions";
import { LeadsPageClient } from "./components/LeadsPageClient";

interface LeadsPageProps {
  searchParams: {
    page?: string;
  };
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const page = Number(searchParams.page) || 1;
  
  // On récupère les leads ET les données pour les formulaires en parallèle
  const [{ data, total, hasNextPage, hasPrevPage }, { users, subcontractors }] = await Promise.all([
    getLeads(page),
    getLeadFormData()
  ]);

  return (
    <LeadsPageClient 
      leads={data}
      users={users}
      subcontractors={subcontractors}
      totalItems={total}
      itemsPerPage={10}
      hasNextPage={hasNextPage}
      hasPrevPage={hasPrevPage}
    />
  );
}