// app/administration/settings/components/UserManagement.tsx
"use client";

import { useState } from "react";
import type { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { UserFormModal } from "./UserFormModal";
import { DeleteUserButton } from "./DeleteUserButton";
import { AddUserButton } from "./AddUserButton";

const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;

export function UserManagement({ users }: { users: User[] }) {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };
  
  if (typeof window !== 'undefined') {
    (window as any).openUserModal = (user = null) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };
  }

  return (
    <>
      <div className="bg-white dark:bg-dark-container rounded-lg shadow-md">
        <div className="p-4 border-b dark:border-dark-border flex justify-between items-center">
          <h3 className="font-semibold text-lg dark:text-dark-text">Utilisateurs de l'application</h3>
          <AddUserButton />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-gray-200 dark:border-dark-border">
              <tr>
                <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Nom</th>
                <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Email</th>
                <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Rôle</th>
                <th className="p-4 text-sm font-medium text-gray-500 dark:text-dark-subtle">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                  <td className="p-4 text-sm font-medium text-gray-800 dark:text-dark-text">{user.name}</td>
                  <td className="p-4 text-sm text-gray-600 dark:text-dark-subtle">{user.email}</td>
                  <td className="p-4 text-sm text-gray-600 dark:text-dark-subtle">{user.role}</td>
                  <td className="p-4 flex items-center gap-4">
                    <button onClick={() => handleEdit(user)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                      <EditIcon />
                    </button>
                    <DeleteUserButton userId={user.id} isCurrentUser={session?.user?.id === user.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={editingUser}
      />
    </>
  );
}