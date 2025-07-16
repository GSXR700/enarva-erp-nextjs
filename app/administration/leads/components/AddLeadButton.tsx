// app/administration/leads/components/AddLeadButton.tsx
"use client";

import { Plus } from "lucide-react";
import Link from "next/link";

export const AddLeadButton = () => {
  return (
    <Link
      href="/administration/leads/new"
      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 ring-offset-background bg-blue-600 text-white hover:bg-blue-700 h-10 py-2 px-4"
    >
      <Plus className="mr-2 h-4 w-4" />
      Ajouter un Lead
    </Link>
  );
};