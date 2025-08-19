// lib/socket.ts
import { Server as IOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import prisma from './prisma';

import type { Notification } from '@prisma/client';

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
  "location-update": (data: {
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

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  userId: string;
}

type CustomSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
type CustomServer = IOServer<ClientToServerEvents, ServerToClientEvents>;

// Global socket instance
declare global {
  var io: CustomServer | undefined;
}

const onlineUsers = new Map<string, string>(); // Map<userId, socketId>

// 🔧 AMÉLIORATION: Type de retour plus explicite avec documentation
export function getIO(): CustomServer | undefined {
  return global.io;
}

export function initSocket(httpServer: HttpServer): CustomServer {
  if (global.io) {
    console.log("Socket.IO server already initialized");
    return global.io;
  }

  const io = new IOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: { 
      origin: process.env.NODE_ENV === 'production' 
        ? [process.env.NEXTAUTH_URL!, process.env.NEXT_PUBLIC_APP_URL!].filter(Boolean)
        : ["http://localhost:3000", "http://127.0.0.1:3000"],
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Connection handler
  io.on('connection', (socket: CustomSocket) => {
    console.log(`🔌 Socket connecté: ${socket.id}`);

    // Gestion des rooms utilisateur
    socket.on('join-room', async (userId: string) => {
      try {
        if (!userId) return;
        
        socket.data.userId = userId;
        await socket.join(userId);
        
        // Mettre à jour le statut en ligne
        onlineUsers.set(userId, socket.id);
        
        await prisma.user.update({
          where: { id: userId },
          data: { isOnline: true, lastSeen: new Date() }
        });

        // Émettre le changement de statut
        socket.broadcast.emit('user-status-changed', { 
          userId, 
          isOnline: true 
        });

        console.log(`🔌 Utilisateur ${userId} connecté avec socket ${socket.id}`);
      } catch (error) {
        console.error('Erreur lors de la connexion:', error);
      }
    });

    // Gestion de la déconnexion
    socket.on('disconnect', async () => {
      try {
        const userId = socket.data.userId;
        if (userId) {
          onlineUsers.delete(userId);
          
          await prisma.user.update({
            where: { id: userId },
            data: { isOnline: false, lastSeen: new Date() }
          });

          socket.broadcast.emit('user-status-changed', { 
            userId, 
            isOnline: false 
          });

          console.log(`🔌 Utilisateur ${userId} déconnecté`);
        }
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
      }
    });
  });

  global.io = io;
  console.log("✅ Socket.IO server initialized successfully");
  
  return io;
}