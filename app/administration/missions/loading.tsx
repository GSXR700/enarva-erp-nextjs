// app/administration/missions/loading.tsx
import { PageHeaderSkeleton } from "../components/skeletons/PageHeaderSkeleton";
import { TableSkeleton } from "../components/skeletons/TableSkeleton";

export default function Loading() {
  const headers = ["Mission (Commande)", "Client", "Employé Assigné", "Date Planifiée", "Statut", "Actions"];
  return (
    <div>
      <PageHeaderSkeleton />
      <TableSkeleton headers={headers} />
    </div>
  );
}