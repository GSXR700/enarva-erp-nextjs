// enarva-nextjs-dashboard-app/app/administration/clients/components/ClientList.tsx
"use client";

import type { Client } from "@prisma/client";
import { DeleteClientButton } from "./DeleteClientButton";

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
  </svg>
);

export function ClientList({ clients, onEditClient }: { clients: Client[]; onEditClient: (client: Client) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="border-b border-gray-200 dark:border-gray-700">
          <tr>
            <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Nom</th>
            <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Email</th>
            <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Téléphone</th>
            <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {clients.map((client) => (
            <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
              {/* CORRECTION: Use client.nom instead of client.name */}
              <td className="p-4 text-sm text-gray-800 dark:text-dark-text">{client.nom}</td>
              <td className="p-4 text-sm text-gray-600 dark:text-dark-subtle">{client.email || "-"}</td>
              <td className="p-4 text-sm text-gray-600 dark:text-dark-subtle">{client.telephone || "-"}</td>
              <td className="p-4 flex items-center gap-4">
                <button onClick={() => onEditClient(client)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                  <EditIcon />
                </button>
                <DeleteClientButton clientId={client.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {clients.length === 0 && (
        <p className="text-center text-gray-500 py-8 dark:text-dark-subtle">Aucun client trouvé.</p>
      )}
    </div>
  );
}