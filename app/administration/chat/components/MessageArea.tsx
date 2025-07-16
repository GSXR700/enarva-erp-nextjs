// enarva-nextjs-dashboard-app/app/administration/chat/components/MessageArea.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Send, Check, CheckCheck, Loader2 } from 'lucide-react';
import { UserAvatar } from '../../components/UserAvatar';
import { ConversationWithDetails } from './ChatLayout';

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string | null; image?: string | null; };
  conversationId: string;
  deliveredAt?: string | null;
  readAt?: string | null;
}

const MessageStatus = ({ msg }: { msg: Message }) => {
    if (msg.readAt) return <CheckCheck size={16} className="text-blue-400" />;
    if (msg.deliveredAt) return <CheckCheck size={16} className="text-gray-400" />;
    return <Check size={16} className="text-gray-400" />;
};

const TypingIndicator = () => (
    <div className="flex justify-start">
        <div className="max-w-xs lg:max-w-md p-3 rounded-lg bg-gray-200 dark:bg-dark-surface rounded-bl-none flex items-center gap-1">
            <span className="h-2 w-2 bg-gray-400 rounded-full animate-[typing-bubble_1.4s_infinite_0.2s]"></span>
            <span className="h-2 w-2 bg-gray-400 rounded-full animate-[typing-bubble_1.4s_infinite_0.4s]"></span>
            <span className="h-2 w-2 bg-gray-400 rounded-full animate-[typing-bubble_1.4s_infinite_0.6s]"></span>
        </div>
    </div>
);

const formatLastSeen = (date: Date | null | undefined): string => {
    if (!date) return "Hors ligne";
    const now = new Date();
    const lastSeenDate = new Date(date);
    const diffSeconds = Math.floor((now.getTime() - lastSeenDate.getTime()) / 1000);
    if (diffSeconds < 60) return "Dernière connexion il y a un instant";
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `Dernière connexion il y a ${diffMinutes} min`;
    return `Dernière connexion à ${lastSeenDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
};

// CORRECTION : Ajout de `isLoading` dans la liste des props
export function MessageArea({
    conversation,
    messages,
    onSendMessage,
    isTyping,
    isLoading, // <-- PROP AJOUTÉE
}: {
    conversation: ConversationWithDetails;
    messages: Message[];
    onSendMessage: (content: string) => void;
    isTyping: boolean;
    isLoading: boolean; // <-- TYPE AJOUTÉ
}) {
  const { data: session } = useSession();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages, isTyping]);


  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage('');
  };

  const otherParticipant = conversation.participants[0];

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b dark:border-dark-border flex items-center gap-3">
        <UserAvatar src={otherParticipant?.image} name={otherParticipant?.name} size={40} />
        <div>
            <h3 className="font-semibold text-gray-800 dark:text-dark-text">{otherParticipant?.name || 'Utilisateur'}</h3>
            <div className="flex items-center gap-1.5 text-xs">
                <span className={`h-2 w-2 rounded-full ${otherParticipant?.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                <span className="text-gray-500 dark:text-dark-subtle">
                    {otherParticipant?.isOnline ? 'En ligne' : formatLastSeen(otherParticipant?.lastSeen)}
                </span>
            </div>
        </div>
      </div>
      <div className="flex-1 p-6 overflow-y-auto space-y-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`flex items-end gap-2 ${msg.sender.id === session?.user?.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md p-3 rounded-lg animate-slide-in-bottom ${msg.sender.id === session?.user?.id ? 'bg-primary text-white rounded-br-none' : 'bg-gray-200 dark:bg-dark-surface text-gray-800 dark:text-dark-text rounded-bl-none'}`}>
                <div className="flex items-end gap-2">
                  <p className="text-sm break-words">{msg.content}</p>
                  <div className="flex-shrink-0 flex items-center gap-1">
                      <span className={`text-xs ${msg.sender.id === session?.user.id ? 'text-blue-100' : 'text-gray-500 dark:text-dark-subtle'}`}>{new Date(msg.createdAt).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</span>
                      {msg.sender.id === session?.user?.id && <MessageStatus msg={msg} />}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t dark:border-dark-border">
        <form onSubmit={handleFormSubmit} className="flex items-center gap-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            className="flex-1 p-2 border rounded-full bg-gray-100 dark:bg-dark-background dark:border-dark-border text-gray-800 dark:text-dark-text"
          />
          <button type="submit" className="p-3 rounded-full bg-primary text-white hover:opacity-90 disabled:opacity-50" disabled={!newMessage.trim()}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}