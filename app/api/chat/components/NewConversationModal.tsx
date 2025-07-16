// app/administration/chat/components/NewConversationModal.tsx
"use client";

import { useState } from 'react';

// CORRECTION: Définir le type simple pour les utilisateurs, correspondant aux données reçues
interface SimpleUser {
    id: string;
    name: string | null;
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    users: SimpleUser[]; // Utiliser le type corrigé
    onConversationStarted: () => void;
}

export function NewConversationModal({ isOpen, onClose, users, onConversationStarted }: ModalProps) {
    const [selectedUserId, setSelectedUserId] = useState('');

    if (!isOpen) return null;
    
    // Cette fonction sera implémentée à la prochaine étape
    const handleStart = async () => {
        if (selectedUserId) {
            alert(`Logique de création de conversation à implémenter pour l'ID: ${selectedUserId}`);
            onConversationStarted();
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl dark:bg-dark-container">
                <h3 className="text-lg font-bold text-gray-800 dark:text-dark-text">Nouvelle Conversation</h3>
                <p className="mt-1 mb-4 text-sm text-gray-500 dark:text-dark-subtle">
                    Sélectionnez un utilisateur pour démarrer une nouvelle conversation.
                </p>
                <select 
                    value={selectedUserId} 
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border text-gray-800 dark:text-dark-text"
                >
                    <option value="">Choisir un utilisateur...</option>
                    {users.map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                </select>
                <div className="flex justify-end gap-4 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 font-bold text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
                        Annuler
                    </button>
                    <button onClick={handleStart} disabled={!selectedUserId} className="px-4 py-2 font-bold text-white bg-primary rounded-lg hover:opacity-90 disabled:opacity-50">
                        Démarrer
                    </button>
                </div>
            </div>
        </div>
    );
}