import { PageHeaderSkeleton } from "../components/skeletons/PageHeaderSkeleton";
import { TableSkeleton } from "../components/skeletons/TableSkeleton";

export default function Loading() {
  const headers = ["Numéro", "Client", "Date", "Total TTC", "Statut", "Actions"];
  return (
    <div>
      <PageHeaderSkeleton />
      <TableSkeleton headers={headers} />
    </div>
  );
}