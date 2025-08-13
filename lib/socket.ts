// enarva-nextjs-dashboard-app/lib/socket.ts
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
      origin: process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_APP_URL : "*",
      methods: ["GET", "POST"],
      credentials: true
    },
    pingTimeout: 60000,
    connectTimeout: 60000,
  });

  global.io = io;

  io.on('connection', (socket: CustomSocket) => {
    console.log(`🔌 Client connected: ${socket.id}`);
      
    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
      
      // Find and remove user from online users
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          try {
            onlineUsers.delete(userId);
            
            // Update user status
            await prisma.user.updateMany({
              where: {
                id: userId,
                isOnline: true
              },
              data: {
                isOnline: false,
                lastSeen: new Date()
              }
            });

            // Notify other clients
            socket.broadcast.emit('user-status-changed', {
              userId: userId,
              isOnline: false
            });
            break;
          } catch (err) {
            console.error('Error updating user status:', err);
          }
        }
      }
    });

      socket.on('join-room', async (userId: string) => {
        try {
          const user = await prisma.user.findUnique({
            where: { id: userId }
          });
          
          if (user) {
            socket.join(userId);
            onlineUsers.set(userId, socket.id);
            
            await prisma.user.update({ 
              where: { id: userId }, 
              data: { 
                isOnline: true,
                lastSeen: new Date(),
                lastKnownIp: socket.handshake.address,
                lastUserAgent: socket.handshake.headers['user-agent'] as string || null
              } 
            });

            socket.broadcast.emit('user-status-changed', {
              userId: userId,
              isOnline: true
            });
          } else {
            console.log(`Socket join-room: User ${userId} not found`);
          }
        } catch (err) {
          console.error('Error updating user status:', err);
        }
      });
    });

    return io;
}
