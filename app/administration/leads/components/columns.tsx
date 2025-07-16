// app/administration/leads/components/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@prisma/client";
import { CellAction } from "./CellAction";
import { UserAvatar } from "@/app/administration/components/UserAvatar";
import { LeadWithAssignedUser } from "./LeadsPageClient";
import { ArrowUpDown } from "lucide-react";

export const leadColumns: ColumnDef<LeadWithAssignedUser>[] = [
    { 
      accessorKey: "nom", 
      header: "Nom" 
    },
    { 
      accessorKey: "statut", 
      header: ({ column }) => (
        <button className="flex items-center" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Statut
            <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      ),
    },
    { 
      accessorKey: "telephone", 
      header: "Téléphone" 
    },
    { 
      accessorKey: "canal", 
      header: "Canal" 
    },
    { 
      accessorKey: "assignedTo", 
      header: "Responsable",
      cell: ({ row }) => {
        const user = row.original.assignedTo;
        return user ? (
            <div className="flex items-center gap-2" title={user.name ?? "Utilisateur"}>
                <UserAvatar src={user.image} name={user.name} size={24} />
                <span className="truncate hidden sm:inline-block">{user.name}</span>
            </div>
        ) : <span className="text-xs text-gray-500">N/A</span>;
      }
    },
    { 
      accessorKey: "date_creation", 
      header: "Date d'entrée",
      cell: ({ row }) => new Date(row.original.date_creation).toLocaleDateString('fr-FR'),
    },
    { 
      id: "actions", 
      cell: ({ row }) => <CellAction data={row.original} /> 
    },
];