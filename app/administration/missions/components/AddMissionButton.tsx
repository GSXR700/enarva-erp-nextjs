// app/administration/missions/components/AddMissionButton.tsx
"use client";

import { Plus } from "lucide-react";

// Le composant ne reçoit plus de données, mais une simple fonction à exécuter
interface AddMissionButtonProps {
    onClick: () => void;
}

export const AddMissionButton = ({ onClick }: AddMissionButtonProps) => {
    return (
        // Remplacement du composant <Button> par un simple <button> HTML avec des classes Tailwind
        <button 
            onClick={onClick}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark"
        >
            <Plus className="mr-2 h-4 w-4" />
            Mission
        </button>
    );
};