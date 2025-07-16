// app/administration/settings/components/DeleteUserButton.tsx
"use client";

import { deleteUser } from "../actions";

const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

export function DeleteUserButton({ userId, isCurrentUser }: { userId: string, isCurrentUser: boolean }) {
  const handleDelete = async () => {
    if (isCurrentUser) {
        alert("Vous ne pouvez pas supprimer votre propre compte.");
        return;
    }
    if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) {
      const result = await deleteUser(userId);
      if (result.error) {
        alert(result.error);
      }
    }
  };

  return (
    <button onClick={handleDelete} disabled={isCurrentUser} className="text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed dark:text-red-400 dark:hover:text-red-300">
      <TrashIcon />
    </button>
  );
}