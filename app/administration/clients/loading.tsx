// enarva-nextjs-dashboard-app/app/administration/clients/loading.tsx
import { PageHeaderSkeleton } from "@/app/administration/components/skeletons/PageHeaderSkeleton";
import { TableSkeleton } from "@/app/administration/components/skeletons/TableSkeleton";

export default function Loading() {
  const headers = ["Nom", "Email", "Téléphone", "Actions"];
  
  return (
    <div>
      {/* Affiche immédiatement le squelette de l'en-tête */}
      <PageHeaderSkeleton />
      
      {/* Affiche immédiatement le squelette du tableau */}
      <div className="bg-white dark:bg-dark-container rounded-lg shadow-md">
        <TableSkeleton headers={headers} />
      </div>
    </div>
  );
}