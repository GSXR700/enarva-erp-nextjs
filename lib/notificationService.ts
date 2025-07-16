// enarva-nextjs-dashboard-app/lib/notificationService.ts
import prisma from './prisma';
import { getIO } from './socket';
import type { Notification as PrismaNotification, User } from '@prisma/client';
import type { Notification } from '@/app/context/NotificationContext';

interface NotificationPayload {
  userId: string;
  message: string;
  link?: string | null;
  senderId?: string | null;
  type?: 'MESSAGE' | 'ALERT' | 'INFO' | 'TASK' | 'SYSTEM';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  expiresAt?: Date | null;
}

type NotificationWithSender = Notification & {
  sender?: Pick<User, 'name' | 'image'> | null;
}

interface NotificationResponse {
  success: boolean;
  notification?: NotificationWithSender;
  error?: string;
  delivered?: boolean;
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification) {
      console.warn("Notification non trouvée:", notificationId);
      return false;
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    });
    return true;
  } catch (error) {
    console.error("Erreur lors du marquage de la notification comme lue:", error);
    return false;
  }
}

export async function createAndEmitNotification(
  { userId, message, link, senderId, type = 'INFO', priority = 'MEDIUM', expiresAt }: NotificationPayload
): Promise<NotificationResponse> {
  try {
    // Validate socket connection first
    const io = getIO();
    if (!io) {
      throw new Error('Socket.IO instance not initialized');
    }

    // Create notification with enhanced data
    const notification = await prisma.notification.create({
      data: {
        userId,
        message,
        link: link ?? null,
        senderId: senderId ?? null,
        read: false,
        createdAt: new Date()
      },
      include: {
        sender: {
          select: { 
            name: true, 
            image: true 
          }
        }
      }
    }) as NotificationWithSender;

    // Attempt real-time delivery
    let delivered = false;
    try {
      // Check if user is connected
      const sockets = await io.in(userId).fetchSockets();
      const isUserConnected = sockets.length > 0;

      if (isUserConnected) {
        const notificationPayload = {
          ...notification,
          priority: priority ?? 'MEDIUM',
          type: type ?? 'INFO',
          createdAt: typeof notification.createdAt === 'string' 
            ? notification.createdAt 
            : notification.createdAt.toISOString()
        } satisfies Notification;
        io.to(userId).emit('new-notification', notificationPayload);
        
        // Mark as read for tracking if high priority
        if (priority === 'HIGH') {
          await prisma.notification.update({
            where: { id: notification.id },
            data: { read: true }
          });
        }
        delivered = true;
      }
    } catch (socketError) {
      console.error("[SOCKET_EMIT] Erreur d'émission 'new-notification':", socketError);
      // Don't throw - we still created the notification successfully
    }

    return {
      success: true,
      notification,
      delivered,
    };

  } catch (error) {
    console.error("Erreur lors de la création/émission de la notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      delivered: false
    };
  }
}