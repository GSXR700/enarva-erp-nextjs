"use client";

import { PlusCircle } from "lucide-react";

export function AddSubcontractorButton() {
  const handleClick = () => {
    if ((window as any).openSubcontractorModal) {
      (window as any).openSubcontractorModal();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="bg-primary hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
    >
      <PlusCircle size={18} />
      Nouveau Partenaire
    </button>
  );
}