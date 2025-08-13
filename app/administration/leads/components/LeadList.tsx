// app/administration/leads/components/LeadList.tsx

"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  HeaderGroup,
  Row,
} from "@tanstack/react-table";
import { leadColumns } from "./columns";
import { LeadWithAssignedUser } from "./LeadsPageClient";
import { PaginationControls } from "@/app/administration/components/PaginationControls";

interface LeadListProps {
  data: LeadWithAssignedUser[];
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function LeadList({
  data,
  totalItems,
  itemsPerPage,
  hasNextPage,
  hasPrevPage
}: LeadListProps) {

  const table = useReactTable({
    data,
    columns: leadColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:bg-dark-surface dark:border-dark-border shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="[&_tr]:border-b dark:[&_tr]:border-dark-border">
            {table.getHeaderGroups().map((headerGroup: HeaderGroup<LeadWithAssignedUser>) => (
              <tr key={headerGroup.id} className="transition-colors hover:bg-gray-100/50 dark:hover:bg-white/5">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="h-12 px-4 text-left align-middle font-medium text-gray-500 dark:text-dark-subtle">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row: Row<LeadWithAssignedUser>) => (
                <tr
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b transition-colors hover:bg-gray-100/50 data-[state=selected]:bg-gray-100 dark:border-dark-border dark:hover:bg-white/5 dark:data-[state=selected]:bg-dark-border"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-4 align-middle text-gray-800 dark:text-white">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={leadColumns.length}
                  className="h-24 text-center p-4 text-gray-500 dark:text-dark-subtle"
                >
                  Aucun prospect trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <PaginationControls
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
}