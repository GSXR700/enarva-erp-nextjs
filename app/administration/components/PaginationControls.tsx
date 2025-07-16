//app/administration/components/PaginationControls.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalItems: number;
  itemsPerPage: number;
}

export const PaginationControls = ({
  hasNextPage,
  hasPrevPage,
  totalItems,
  itemsPerPage,
}: PaginationControlsProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = searchParams.get("page") ?? "1";
  const per_page = searchParams.get("per_page") ?? String(itemsPerPage);
  
  const totalPages = Math.ceil(totalItems / Number(per_page));

  return (
    <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-dark-border">
      <div className="text-sm text-gray-500 dark:text-dark-subtle">
        Page {page} sur {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <button
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed dark:bg-dark-surface dark:border-dark-border dark:text-dark-text"
          disabled={!hasPrevPage}
          onClick={() => {
            router.push(`?page=${Number(page) - 1}&per_page=${per_page}`);
          }}
        >
          <ChevronLeft size={16} />
          Précédent
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed dark:bg-dark-surface dark:border-dark-border dark:text-dark-text"
          disabled={!hasNextPage}
          onClick={() => {
            router.push(`?page=${Number(page) + 1}&per_page=${per_page}`);
          }}
        >
          Suivant
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};