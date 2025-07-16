// app/administration/settings/loading.tsx
import { TableSkeleton } from "../components/skeletons/TableSkeleton";

export default function Loading() {
  const headers = ["Nom", "Email", "Rôle", "Actions"];
  return (
    <div className="space-y-8">
      <div className="h-9 w-1/3 bg-gray-200 rounded-md dark:bg-dark-surface animate-pulse"></div>
      <TableSkeleton headers={headers} />
    </div>
  );
}