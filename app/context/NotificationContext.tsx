// app/context/NotificationContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { getClientSocket, disconnectSocket, listenToSocket } from '@/lib/socketClient';
import type { Socket } from 'socket.io-client';

export interface Notification {
  id: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string | Date;
  userId: string;
  senderId: string | null;
  type: 'MESSAGE' | 'ALERT' | 'INFO' | 'TASK' | 'SYSTEM';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  sender?: {
    name: string | null;
    image: string | null;
  } | null;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  socket: Socket | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) {
      return;
    }

    try {
      const clientSocket = getClientSocket();
      setSocket(clientSocket as any);

      // Rejoindre la room utilisateur
      clientSocket.emit('join-room', session.user.id);

      // Récupérer les notifications initiales
      fetch('/api/notifications')
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch notifications');
          return res.json();
        })
        .then(data => {
          setNotifications(data || []);
          setUnreadCount((data || []).filter((n: Notification) => !n.read).length);
        })
        .catch(error => {
          console.error('Erreur lors du chargement des notifications:', error);
        });

      // Écouter les nouvelles notifications
      const unsubscribeNotifications = listenToSocket('new-notification', (newNotification: Notification) => {
        setNotifications(prev => {
          const updated = [newNotification, ...prev].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          return updated;
        });
        setUnreadCount(prev => prev + 1);
      });

      return () => {
        unsubscribeNotifications();
        disconnectSocket();
        setSocket(null);
      };
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du socket:', error);
    }
  }, [status, session]);

  const markAsRead = async (id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (!notification || notification.read) {
      return;
    }

    // Mise à jour optimiste
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
      
      // Annuler la mise à jour optimiste en cas d'erreur
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, read: false } : n
      ));
      setUnreadCount(prev => prev + 1);
    }
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      markAsRead, 
      socket 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};