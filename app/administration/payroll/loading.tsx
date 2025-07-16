// enarva-nextjs-dashboard-app/app/administration/payroll/loading.tsx
import { PageHeaderSkeleton } from "../components/skeletons/PageHeaderSkeleton";
import { TableSkeleton } from "../components/skeletons/TableSkeleton";

export default function Loading() {
  const headers = ["Employé", "Email", "Solde Actuel", "Actions"];
  return (
    <div>
      <PageHeaderSkeleton />
      <div className="bg-white dark:bg-dark-container rounded-lg shadow-md">
        <TableSkeleton headers={headers} />
      </div>
    </div>
  );
}