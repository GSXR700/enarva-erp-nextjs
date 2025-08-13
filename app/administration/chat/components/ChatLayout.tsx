// app/administration/chat/components/ChatLayout.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { ConversationList } from "./ConversationList";
import { MessageArea, Message } from "./MessageArea";
import { NewConversationModal } from "./NewConversationModal";
import { MessageSquarePlus, MessageCircle } from "lucide-react";
import { useNotifications } from "@/app/context/NotificationContext";

interface SimpleUser { id: string; name: string | null; image?: string | null; isOnline?: boolean; lastSeen?: Date | null; }
export interface ConversationWithDetails {
  id: string;
  participants: SimpleUser[];
  messages: Message[];
  updatedAt: string;
  unreadCount: number;
}

export function ChatLayout({ allUsers }: { allUsers: SimpleUser[] }) {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { socket } = useNotifications();

  const selectedConversationRef = useRef(selectedConversation);
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  const fetchConversations = useCallback(() => {
    fetch('/api/chat/conversations').then(res => res.json()).then(setConversations);
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!socket || !session) return;

    const handleNewMessage = (newMessage: Message) => {
      setConversations(prev =>
        prev.map(c => c.id === newMessage.conversationId
            ? { ...c, messages: [newMessage], updatedAt: newMessage.createdAt, unreadCount: c.id === selectedConversationRef.current?.id ? 0 : (c.unreadCount || 0) + 1 }
            : c
        ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      );

      if (newMessage.conversationId === selectedConversationRef.current?.id) {
        setMessages(prev => [...prev, newMessage]);
        fetch('/api/chat/messages/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversationId: newMessage.conversationId }),
        });
      }
    };

    const handleUserStatusChange = ({ userId, isOnline, lastSeen }: { userId: string; isOnline: boolean; lastSeen?: Date }) => {
        const updateUser = (user: SimpleUser) => user.id === userId ? { ...user, isOnline, lastSeen } : user;
        setConversations(prev => prev.map(convo => ({ ...convo, participants: convo.participants.map(updateUser) })));
        if (selectedConversationRef.current?.participants.some(p => p.id === userId)) {
            setSelectedConversation(prev => prev ? { ...prev, participants: prev.participants.map(updateUser) } : null);
        }
    };

    socket.on('new-message', handleNewMessage);
    socket.on('user-status-changed', handleUserStatusChange);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('user-status-changed', handleUserStatusChange);
    };
  }, [socket, session, fetchConversations]);

  const handleSelectConversation = async (conversation: ConversationWithDetails) => {
    setIsLoadingMessages(true);
    setSelectedConversation(conversation);
    try {
      const res = await fetch(`/api/chat/messages/${conversation.id}`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error(error);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }

    if (conversation.unreadCount > 0) {
        fetch('/api/chat/messages/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversationId: conversation.id }),
        });
        setConversations(prev => prev.map(c => c.id === conversation.id ? { ...c, unreadCount: 0 } : c));
    }
  };

  const handleConversationStarted = () => {
    setIsModalOpen(false);
    fetchConversations();
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !session || !selectedConversation) return;

    await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: content,
            conversationId: selectedConversation.id,
            recipientId: selectedConversation.participants[0].id,
        })
    });
  };

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
        {selectedConversation ? (
            <MessageArea
                key={selectedConversation.id}
                conversation={selectedConversation}
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoadingMessages}
                isTyping={isTyping}
            />
        ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-dark-subtle">
                <MessageCircle size={48} className="mb-4" />
                <h3 className="text-lg font-semibold">Sélectionnez une conversation</h3>
                <p className="max-w-xs">Choisissez une conversation dans la liste de gauche pour afficher les messages.</p>
            </div>
        )}
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