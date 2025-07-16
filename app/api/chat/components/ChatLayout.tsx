// app/administration/chat/components/ChatLayout.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ConversationList } from "./ConversationList";
import { MessageArea } from "./MessageArea";
import { NewConversationModal } from "./NewConversationModal";
import { MessageSquarePlus } from "lucide-react";

// Le type pour les utilisateurs dans la liste de création
interface SimpleUser {
    id: string;
    name: string | null;
}

export interface ConversationWithDetails {
  id: string;
  participants: { id: string; name: string | null }[];
  messages: { content: string; createdAt: string }[];
  updatedAt: string;
}

export function ChatLayout({ allUsers }: { allUsers: SimpleUser[] }) {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchConversations = () => {
    fetch('/api/chat/conversations')
      .then(res => res.json())
      .then(data => setConversations(data));
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleSelectConversation = (conversation: ConversationWithDetails) => {
    setSelectedConversation(conversation);
  };
  
  const handleConversationStarted = () => {
    setIsModalOpen(false);
    fetchConversations();
  }

  return (
    <div className="flex h-full bg-white dark:bg-dark-container rounded-lg shadow-md overflow-hidden">
      <div className="w-full md:w-1/3 border-r dark:border-dark-border flex flex-col">
        <div className="p-4 border-b dark:border-dark-border flex justify-between items-center">
            <h2 className="font-semibold text-lg dark:text-dark-text">Messagerie</h2>
            <button onClick={() => setIsModalOpen(true)} title="Nouvelle conversation" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface">
                <MessageSquarePlus size={20} className="text-gray-600 dark:text-dark-subtle"/>
            </button>
        </div>
        <ConversationList
          conversations={conversations}
          onSelectConversation={handleSelectConversation}
          selectedConversationId={selectedConversation?.id}
        />
      </div>
      <div className="hidden md:flex w-2/3 flex-col">
        <MessageArea conversation={selectedConversation} />
      </div>
      <NewConversationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        users={allUsers}
        onConversationStarted={handleConversationStarted}
      />
    </div>
  );
}