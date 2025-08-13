// app/context/NotificationContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from "socket.io-client";
import type { Notification as PrismaNotification } from '@prisma/client';

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
    if (status !== 'authenticated' || !session?.user?.id) return;

    // Use environment variable for WebSocket URL
    const socketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3001';
    const newSocket: Socket = io(socketUrl);
    setSocket(newSocket);

    newSocket.emit('join-room', session.user.id);

    // Fetch initial notifications
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.read).length);
      });

    const handleNewNotification = (newNotification: Notification) => {
      setNotifications(prev => [newNotification, ...prev].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setUnreadCount(prev => prev + 1);
    };

    newSocket.on('new-notification', handleNewNotification);

    return () => {
      newSocket.off('new-notification', handleNewNotification);
      newSocket.disconnect();
    };
  }, [status, session]);

  const markAsRead = async (id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
        await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    }
  };

  const value = { notifications, unreadCount, markAsRead, socket };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};