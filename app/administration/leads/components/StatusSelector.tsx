// app/administration/leads/components/StatusSelector.tsx
"use client";

import { useState } from "react";
import { Lead, LeadStatus } from "@prisma/client";
import { updateLeadStatus } from "../actions";
import { leadStatusMapping } from "@/lib/statusMapping"; // <-- FIX: Changed 'StatusMapping' to 'statusMapping'
import { toast } from "sonner";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

interface StatusSelectorProps {
  lead: Lead;
}

export function StatusSelector({ lead }: StatusSelectorProps) {
  const [currentStatus, setCurrentStatus] = useState(lead.statut);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (newStatus: LeadStatus) => {
    setIsLoading(true);
    setIsOpen(false); // Close the dropdown immediately

    // Optimistic update for a better user experience
    setCurrentStatus(newStatus);

    const result = await updateLeadStatus(lead.id, newStatus);

    if (result.success) {
      toast.success("Statut mis à jour !");
    } else {
      toast.error("Échec de la mise à jour.");
      // If the update fails, revert to the original status
      setCurrentStatus(lead.statut);
    }
    setIsLoading(false);
  };

  // Gracefully handle any status that might not be in the mapping yet
  const { label, color } = leadStatusMapping[currentStatus] || { label: currentStatus, color: "bg-gray-200 text-gray-800" };

  return (
    <div className="relative w-48">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`w-full flex items-center justify-between px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${color} ${isLoading ? 'cursor-not-allowed' : ''}`}
      >
        {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
        ) : (
            <>
                <span>{label}</span>
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </>
        )}
      </button>

      {isOpen && (
        <div 
            className="absolute z-10 mt-1 w-full bg-white dark:bg-dark-surface shadow-lg rounded-md border dark:border-dark-border"
            onMouseLeave={() => setIsOpen(false)} // Close when mouse leaves the dropdown
        >
          <ul className="max-h-60 overflow-y-auto">
            {Object.entries(leadStatusMapping).map(([statusKey, { label }]) => (
              <li
                key={statusKey}
                onClick={() => handleStatusChange(statusKey as LeadStatus)}
                className="px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-dark-highlight-bg cursor-pointer flex items-center justify-between"
              >
                <span>{label}</span>
                {currentStatus === statusKey && <Check className="h-4 w-4 text-primary" />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}