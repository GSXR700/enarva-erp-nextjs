// app/administration/chat/components/MessageArea.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { ConversationWithDetails } from './ChatLayout';
import { Send, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string | null };
}

export function MessageArea({ conversation }: { conversation: ConversationWithDetails | null }) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }
  
  useEffect(() => {
    if (conversation) {
      fetch(`/api/chat/messages/${conversation.id}`)
        .then(res => res.json())
        .then(data => {
            setMessages(data);
            scrollToBottom();
        });
    } else {
        setMessages([]);
    }
  }, [conversation]);
  
  useEffect(() => {
      scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversation) return;

    const otherParticipant = conversation.participants[0];
    if (!otherParticipant) return;

    const optimisticMessage: Message = {
        id: 'temp-' + Date.now(),
        content: newMessage,
        createdAt: new Date().toISOString(),
        // CORRECTION: Fournir une valeur de secours pour le nom
        sender: { id: session!.user.id, name: session!.user.name || null }
    }
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');

    await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: newMessage,
            conversationId: conversation.id,
            recipientId: otherParticipant.id,
        })
    });
  };

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-dark-subtle">
        <MessageCircle size={48} className="mb-4" />
        <h3 className="text-lg font-semibold">Sélectionnez une conversation</h3>
        <p className="max-w-xs">Choisissez une conversation dans la liste de gauche pour afficher les messages ici.</p>
      </div>
    );
  }
  
  const otherParticipant = conversation.participants[0];

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b dark:border-dark-border">
        <h3 className="font-semibold text-gray-800 dark:text-dark-text">{otherParticipant?.name || 'Utilisateur'}</h3>
      </div>
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender.id === session?.user.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${msg.sender.id === session?.user.id ? 'bg-primary text-white rounded-br-none' : 'bg-gray-200 dark:bg-dark-surface text-gray-800 dark:text-dark-text rounded-bl-none'}`}>
              <p className="text-sm">{msg.content}</p>
              <p className={`text-xs mt-1 text-right ${msg.sender.id === session?.user.id ? 'text-blue-100' : 'text-gray-500 dark:text-dark-subtle'}`}>{new Date(msg.createdAt).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t dark:border-dark-border">
        <form onSubmit={handleSendMessage} className="flex items-center gap-4">
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