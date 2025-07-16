// app/administration/quotes/components/DeleteQuoteButton.tsx
"use client";

import { deleteQuote } from "../actions";

const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

export function DeleteQuoteButton({ quoteId }: { quoteId: string }) {
  const handleDelete = async () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce devis ? Cette action est irréversible.")) {
      const result = await deleteQuote(quoteId);
      if (result.error) {
        alert(result.error);
      }
    }
  };

  return (
    <button onClick={handleDelete} className="p-2 rounded-full text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-700">
      <TrashIcon />
    </button>
  );
}