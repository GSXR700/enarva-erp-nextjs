// lib/socket.ts
import { Server as IOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import prisma from './prisma';

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
  'user-status-changed': (data: { userId: string; isOnline: boolean; lastSeen: Date }) => void;
  'new-notification': (notification: NotificationPayload) => void;
  'new-message': (message: any) => void;
  'messages-read': (data: { conversationId: string }) => void;
  'user-typing': (data: { conversationId: string; userId: string; isTyping: boolean }) => void;
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
  'leave-room': (userId: string) => void;
  'typing': (data: { conversationId: string; recipientId: string; isTyping: boolean }) => void;
  'mark-messages-read': (data: { conversationId: string; recipientId: string }) => void;
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

// Map pour tracker les utilisateurs en ligne
const onlineUsers = new Map<string, Set<string>>(); // Map<userId, Set<socketId>>

export function getIO(): CustomServer | undefined {
  return global.io;
}

export function initSocket(httpServer: HttpServer): CustomServer {
  if (global.io) {
    console.log("✅ Socket.IO server already initialized");
    return global.io;
  }

  const io = new IOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: { 
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.NEXT_PUBLIC_APP_URL 
        : ['http://localhost:3000', 'http://localhost:3001'],
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.on('connection', (socket: CustomSocket) => {
    console.log(`🔌 Nouvelle connexion socket: ${socket.id}`);

    // Gestion de la connexion utilisateur
    socket.on('join-room', async (userId: string) => {
      if (!userId) return;
      
      socket.data.userId = userId;
      socket.join(userId);
      
      // Ajouter à la map des utilisateurs en ligne
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }
      onlineUsers.get(userId)!.add(socket.id);
      
      console.log(`👤 Utilisateur ${userId} rejoint sa room (socket: ${socket.id})`);
      
      // Mettre à jour le statut en ligne dans la DB
      await prisma.user.update({
        where: { id: userId },
        data: { 
          isOnline: true,
          lastSeen: new Date()
        }
      });
      
      // Notifier tous les autres utilisateurs du changement de statut
      socket.broadcast.emit('user-status-changed', {
        userId,
        isOnline: true,
        lastSeen: new Date()
      });
    });

    // Gestion de la déconnexion d'une room
    socket.on('leave-room', async (userId: string) => {
      if (!userId) return;
      
      socket.leave(userId);
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
        }
      }
    });

    // Gestion du typing indicator
    socket.on('typing', ({ conversationId, recipientId, isTyping }) => {
      io.to(recipientId).emit('user-typing', {
        conversationId,
        userId: socket.data.userId || '',
        isTyping
      });
    });

    // Gestion de la lecture des messages
    socket.on('mark-messages-read', async ({ conversationId, recipientId }) => {
      if (!socket.data.userId) return;
      
      // Marquer les messages comme lus dans la DB
      await prisma.message.updateMany({
        where: {
          conversationId,
          senderId: recipientId,
          readAt: null
        },
        data: {
          readAt: new Date()
        }
      });
      
      // Notifier l'expéditeur que ses messages ont été lus
      io.to(recipientId).emit('messages-read', { conversationId });
    });

    // Gestion de la déconnexion
    socket.on('disconnect', async () => {
      const userId = socket.data.userId;
      console.log(`🔌 Déconnexion socket: ${socket.id} (User: ${userId})`);
      
      if (userId) {
        const userSockets = onlineUsers.get(userId);
        if (userSockets) {
          userSockets.delete(socket.id);
          
          // Si l'utilisateur n'a plus de sockets actifs, le marquer comme hors ligne
          if (userSockets.size === 0) {
            onlineUsers.delete(userId);
            
            // Mettre à jour le statut dans la DB avec un délai
            setTimeout(async () => {
              // Vérifier si l'utilisateur ne s'est pas reconnecté
              if (!onlineUsers.has(userId)) {
                await prisma.user.update({
                  where: { id: userId },
                  data: { 
                    isOnline: false,
                    lastSeen: new Date()
                  }
                });
                
                // Notifier les autres utilisateurs
                io.emit('user-status-changed', {
                  userId,
                  isOnline: false,
                  lastSeen: new Date()
                });
              }
            }, 5000); // Délai de 5 secondes avant de marquer hors ligne
          }
        }
      }
    });
  });

  global.io = io;
  console.log("✅ Socket.IO server initialized successfully");
  return io;
}

// Fonction utilitaire pour vérifier si un utilisateur est en ligne
export function isUserOnline(userId: string): boolean {
  return onlineUsers.has(userId) && onlineUsers.get(userId)!.size > 0;
}

// Fonction pour obtenir tous les utilisateurs en ligne
export function getOnlineUsers(): string[] {
  return Array.from(onlineUsers.keys());
}

// Fonction pour émettre une notification
export async function emitNotification(notification: NotificationPayload) {
  const io = getIO();
  if (!io) {
    console.error('❌ Socket.IO non initialisé');
    return false;
  }
  
  try {
    // Vérifier si l'utilisateur est en ligne
    if (isUserOnline(notification.userId)) {
      io.to(notification.userId).emit('new-notification', notification);
      console.log(`📤 Notification envoyée à ${notification.userId}`);
      return true;
    } else {
      console.log(`📴 Utilisateur ${notification.userId} hors ligne, notification sauvegardée`);
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'émission de la notification:', error);
    return false;
  }
}

// Fonction pour émettre un message
export async function emitMessage(message: any, recipientId: string) {
  const io = getIO();
  if (!io) {
    console.error('❌ Socket.IO non initialisé');
    return false;
  }
  
  try {
    io.to(recipientId).emit('new-message', message);
    console.log(`💬 Message envoyé à ${recipientId}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'émission du message:', error);
    return false;
  }
}