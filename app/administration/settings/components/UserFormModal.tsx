// app/administration/settings/components/UserFormModal.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Role } from "@prisma/client";
import type { User } from "@prisma/client";
import { saveUser } from "../actions";

export function UserFormModal({ isOpen, onClose, user }: { isOpen: boolean; onClose: () => void; user: User | null; }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      formRef.current?.reset();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const result = await saveUser(formData);
    if (result.success) {
      onClose();
    } else {
      alert(result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="w-full max-w-lg m-4 bg-white rounded-lg shadow-xl dark:bg-dark-container">
        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="flex items-center justify-between p-4 border-b dark:border-dark-border">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-dark-text">
              {user ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}
            </h3>
            <button type="button" onClick={onClose} className="text-3xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">&times;</button>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="hidden" name="id" defaultValue={user?.id || ""} />
            <div className="md:col-span-2">
              <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Nom complet</label>
              <input id="name" name="name" defaultValue={user?.name || ""} className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border text-gray-800 dark:text-dark-text" required />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Email</label>
              <input id="email" name="email" type="email" defaultValue={user?.email || ""} className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border text-gray-800 dark:text-dark-text" required />
            </div>
             <div className="md:col-span-2">
              <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Mot de passe</label>
              <input id="password" name="password" type="password" placeholder={user ? "Laisser vide pour ne pas changer" : "Mot de passe requis"} className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border text-gray-800 dark:text-dark-text" required={!user} />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="role" className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-subtle">Rôle</label>
              <select id="role" name="role" defaultValue={user?.role || Role.FIELD_WORKER} className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border text-gray-800 dark:text-dark-text">
                <option value={Role.ADMIN}>Administrateur</option>
                <option value={Role.MANAGER}>Manager</option>
                <option value={Role.FINANCE}>Finance</option>
                <option value={Role.FIELD_WORKER}>Employé de terrain</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end p-4 bg-gray-50 rounded-b-lg dark:bg-dark-surface">
            <button type="button" onClick={onClose} className="px-4 py-2 font-bold text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
              Annuler
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 ml-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 dark:bg-primary dark:hover:bg-blue-500">
              {isSubmitting ? "Sauvegarde..." : "Sauvegarder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}