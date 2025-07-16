"use client";

import { PlusCircle } from "lucide-react";

export function AddEquipmentButton() {
  const handleClick = () => {
    if ((window as any).openEquipmentModal) {
      (window as any).openEquipmentModal();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="bg-primary hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
    >
      <PlusCircle size={18} />
      Nouveau Matériel
    </button>
  );
}