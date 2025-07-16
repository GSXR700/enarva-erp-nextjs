// app/administration/employees/loading.tsx
import { PageHeaderSkeleton } from "../components/skeletons/PageHeaderSkeleton";
import { TableSkeleton } from "../components/skeletons/TableSkeleton";

export default function Loading() {
  const headers = ["Nom Complet", "Email", "Rôle", "Actions"];
  return (
    <div>
      <PageHeaderSkeleton />
      <TableSkeleton headers={headers} />
    </div>
  );
}