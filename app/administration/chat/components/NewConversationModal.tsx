// app/administration/chat/components/NewConversationModal.tsx
"use client";

import { useState } from 'react';
import { startOrGetConversation } from '../actions';
import { Loader2 } from 'lucide-react';

interface SimpleUser {
    id: string;
    name: string | null;
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    users: SimpleUser[];
    onConversationStarted: () => void;
}

export function NewConversationModal({ isOpen, onClose, users, onConversationStarted }: ModalProps) {
    const [selectedUserId, setSelectedUserId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;
    
    const handleStart = async () => {
        if (selectedUserId) {
            setIsLoading(true);
            const result = await startOrGetConversation(selectedUserId);
            if(result.success) {
                // La conversation est créée, on informe le composant parent pour qu'il se mette à jour
                onConversationStarted();
            } else {
                alert(result.error);
            }
            setIsLoading(false);
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
                    <button onClick={handleStart} disabled={!selectedUserId || isLoading} className="px-4 py-2 font-bold text-white bg-primary rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
                        {isLoading && <Loader2 className="animate-spin h-4 w-4"/>}
                        {isLoading ? "Démarrage..." : "Démarrer"}
                    </button>
                </div>
            </div>
        </div>
    );
}