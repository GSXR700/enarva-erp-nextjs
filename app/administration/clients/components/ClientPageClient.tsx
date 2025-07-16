// enarva-nextjs-app/app/administration/clients/components/ClientPageClient.tsx
"use client";

import { useState } from "react";
import type { Client } from "@prisma/client";
import { AddClientButton } from "./AddClientButton";
import { ClientList } from "./ClientList";
import { ClientFormModal } from "./ClientFormModal";
import { PaginationControls } from "../../components/PaginationControls"; // Importer le nouveau composant

interface ClientPageClientProps {
  initialClients: Client[];
  totalClients: number;
  itemsPerPage: number;
}

export function ClientPageClient({
  initialClients,
  totalClients,
  itemsPerPage,
}: ClientPageClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const handleOpenModal = (client: Client | null = null) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const hasNextPage =
    (Number(new URLSearchParams(window.location.search).get("page") ?? "1") * itemsPerPage) < totalClients;
  const hasPrevPage = Number(new URLSearchParams(window.location.search).get("page") ?? "1") > 1;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">
          Gestion des Clients
        </h1>
        <AddClientButton onOpenModal={() => handleOpenModal()} />
      </div>

      <div className="bg-white dark:bg-dark-container rounded-lg shadow-md">
        <ClientList clients={initialClients} onEditClient={handleOpenModal} />
        <PaginationControls
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          totalItems={totalClients}
          itemsPerPage={itemsPerPage}
        />
      </div>

      <ClientFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        client={editingClient}
      />
    </div>
  );
}