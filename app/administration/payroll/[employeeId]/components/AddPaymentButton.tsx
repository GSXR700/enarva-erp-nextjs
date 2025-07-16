// enarva-nextjs-dashboard-app/app/administration/payroll/[employeeId]/components/AddPaymentButton.tsx
"use client";

import { PlusCircle } from "lucide-react";

export function AddPaymentButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80"
    >
      <PlusCircle size={18} />
      <span>Nouveau Paiement</span>
    </button>
  );
}