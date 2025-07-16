// enarva-nextjs-dashboard-app/app/administration/products/loading.tsx
import { PageHeaderSkeleton } from "@/app/administration/components/skeletons/PageHeaderSkeleton";
import { TableSkeleton } from "@/app/administration/components/skeletons/TableSkeleton";

export default function Loading() {
  const headers = ["Désignation", "Prix Unitaire (HT)", "Actions"];
  return (
    <div>
      <PageHeaderSkeleton />
      <div className="p-6 bg-white rounded-lg shadow-md dark:bg-dark-container">
        <TableSkeleton headers={headers} />
      </div>
    </div>
  );
}