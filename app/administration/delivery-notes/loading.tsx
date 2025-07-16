import { PageHeaderSkeleton } from "../components/skeletons/PageHeaderSkeleton";
import { TableSkeleton } from "../components/skeletons/TableSkeleton";

export default function Loading() {
  const headers = ["BL N°", "Client", "Commande N°", "Date de Livraison", "Actions"];
  return (
    <div>
      <PageHeaderSkeleton />
      <TableSkeleton headers={headers} />
    </div>
  );
}