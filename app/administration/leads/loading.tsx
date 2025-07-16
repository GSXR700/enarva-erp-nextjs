// app/administration/leads/loading.tsx

import { PageHeaderSkeleton } from "../components/skeletons/PageHeaderSkeleton";
import { TableSkeleton } from "../components/skeletons/TableSkeleton";

export default function LoadingLeads() {
  // Les en-têtes correspondent aux colonnes que nous avons définies
  const headers = ["Numéro", "Contact", "Société", "Statut", "Source", "Assigné à", "Créé le", "Actions"];
  
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <TableSkeleton headers={headers} />
    </div>
  );
}