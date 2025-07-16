// app/administration/chat/components/ConversationList.tsx
"use client";

import { useSession } from "next-auth/react";
import { ConversationWithDetails } from "./ChatLayout";
import { UserAvatar } from "@/app/administration/components/UserAvatar"; // <-- IMPORTER LE NOUVEAU COMPOSANT

interface ConversationListProps {
  conversations: ConversationWithDetails[];
  onSelectConversation: (conversation: ConversationWithDetails) => void;
  selectedConversationId?: string;
}

export function ConversationList({ conversations, onSelectConversation, selectedConversationId }: ConversationListProps) {
    const { data: session } = useSession();

    return (
        <div className="flex-1 overflow-y-auto">
            <ul>
                {conversations.map(convo => {
                    const otherParticipant = convo.participants[0];
                    const lastMessage = convo.messages[0];
                    const isSelected = convo.id === selectedConversationId;
                    const isUnread = convo.unreadCount > 0;

                    return (
                        <li key={convo.id} onClick={() => onSelectConversation(convo)}>
                            <div className={`flex items-center gap-3 p-3 cursor-pointer border-l-4 ${isSelected ? 'border-primary bg-gray-100 dark:bg-dark-surface' : 'border-transparent hover:bg-gray-50 dark:hover:bg-dark-surface'}`}>
                                <div className="relative flex-shrink-0">
                                    {/* CORRECTION: Utilisation du composant UserAvatar */}
                                    <UserAvatar src={otherParticipant?.image} name={otherParticipant?.name} size={40} />
                                    {isUnread && <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-white dark:ring-dark-container"></span>}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex items-center justify-between">
                                        <p className={`font-semibold text-sm text-gray-800 dark:text-dark-text truncate ${isUnread && 'font-extrabold'}`}>{otherParticipant?.name || 'Utilisateur'}</p>
                                        {lastMessage && <p className="text-xs text-gray-400 dark:text-dark-subtle flex-shrink-0">{new Date(lastMessage.createdAt).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</p>}
                                    </div>
                                    <p className={`text-sm truncate ${isUnread ? 'text-gray-700 dark:text-dark-text' : 'text-gray-500 dark:text-dark-subtle'}`}>
                                        {lastMessage ? `${lastMessage.sender.id === session?.user.id ? 'Vous: ' : ''}${lastMessage.content}` : "Aucun message"}
                                    </p>
                                </div>
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}