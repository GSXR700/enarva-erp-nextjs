// lib/socketClient.ts
"use client";

import { io, Socket } from 'socket.io-client';

interface NotificationPayload {
  id: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
  userId: string;
  senderId: string | null;
  type: 'MESSAGE' | 'ALERT' | 'INFO' | 'TASK' | 'SYSTEM';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  sender?: { name: string | null; image: string | null; } | null;
}

interface ServerToClientEvents {
  'user-status-changed': (data: { userId: string; isOnline: boolean }) => void;
  'new-notification': (notification: NotificationPayload) => void;
  'new-message': (message: any) => void;
  'location-update': (data: {
    id: string;
    name: string | null;
    image: string | null;
    currentLatitude: number | null;
    currentLongitude: number | null;
    lastSeen: Date;
  }) => void;
}

interface ClientToServerEvents {
  'join-room': (userId: string) => void;
  'disconnect': () => void;
}

type ClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let clientSocket: ClientSocket | null = null;

export const getClientSocket = (): ClientSocket => {
  if (!clientSocket) {
    const socketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 
                     (process.env.NODE_ENV === 'production' 
                       ? process.env.NEXT_PUBLIC_APP_URL 
                       : 'http://localhost:3000');
    
    clientSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 60000,
    });

    clientSocket.on('connect', () => {
      console.log('🔌 Socket client connecté:', clientSocket?.id);
    });

    clientSocket.on('disconnect', () => {
      console.log('🔌 Socket client déconnecté');
    });

    clientSocket.on('connect_error', (error) => {
      console.error('🔌 Erreur de connexion socket:', error);
    });
  }
  
  return clientSocket;
};

export const disconnectSocket = () => {
  if (clientSocket) {
    clientSocket.disconnect();
    clientSocket = null;
  }
};

export const emitToSocket = (event: string, data: any) => {
  const socket = getClientSocket();
  if (socket.connected) {
    socket.emit(event as any, data);
  }
};

export const listenToSocket = (event: string, callback: (data: any) => void) => {
  const socket = getClientSocket();
  socket.on(event as any, callback);
  
  return () => {
    socket.off(event as any, callback);
  };
};