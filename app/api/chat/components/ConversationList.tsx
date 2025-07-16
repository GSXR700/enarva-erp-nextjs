// app/administration/chat/components/ConversationList.tsx
"use client";

import { ConversationWithDetails } from "./ChatLayout";

interface ConversationListProps {
  conversations: ConversationWithDetails[];
  onSelectConversation: (conversation: ConversationWithDetails) => void;
  selectedConversationId?: string;
}

export function ConversationList({ conversations, onSelectConversation, selectedConversationId }: ConversationListProps) {
    return (
        <div className="flex-1 overflow-y-auto">
            <ul>
                {conversations.map(convo => {
                    const otherParticipant = convo.participants[0];
                    const lastMessage = convo.messages[0];
                    const isSelected = convo.id === selectedConversationId;

                    return (
                        <li key={convo.id} onClick={() => onSelectConversation(convo)}>
                            <div className={`p-4 cursor-pointer border-l-4 ${isSelected ? 'border-primary bg-gray-100 dark:bg-dark-surface' : 'border-transparent hover:bg-gray-50 dark:hover:bg-dark-surface'}`}>
                                <div className="flex items-center justify-between">
                                    <p className="font-bold text-sm text-gray-800 dark:text-dark-text">{otherParticipant?.name || 'Utilisateur inconnu'}</p>
                                    {lastMessage && <p className="text-xs text-gray-400 dark:text-dark-subtle">{new Date(lastMessage.createdAt).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</p>}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-dark-subtle truncate">
                                    {lastMessage?.content || "Aucun message"}
                                </p>
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}