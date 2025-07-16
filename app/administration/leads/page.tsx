// app/administration/leads/page.tsx

import { getLeads, getUsersForAssignment } from "./actions";
import { LeadsPageClient } from "./components/LeadsPageClient";

interface LeadsPageProps {
  searchParams: {
    page?: string;
  };
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const page = Number(searchParams.page) || 1;
  
  // On récupère les leads et les utilisateurs en parallèle pour plus d'efficacité
  const [{ data, total, hasNextPage, hasPrevPage }, users] = await Promise.all([
    getLeads(page),
    getUsersForAssignment()
  ]);

  return (
    <LeadsPageClient 
      leads={data}
      users={users} // On passe la liste des utilisateurs pour les formulaires
      totalItems={total}
      itemsPerPage={10} // Doit correspondre à la valeur dans `actions.ts`
      hasNextPage={hasNextPage}
      hasPrevPage={hasPrevPage}
    />
  );
}