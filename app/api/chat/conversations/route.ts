// app/api/chat/conversations/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const conversations = await prisma.conversation.findMany({
      where: { participantIDs: { has: session.user.id } },
      include: {
        participants: {
          where: { id: { not: session.user.id } },
          select: { id: true, name: true, image: true, isOnline: true, lastSeen: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { sender: { select: { id: true } } }
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const conversationsWithUnread = await Promise.all(
      conversations.map(async (convo) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: convo.id,
            readAt: null,
            senderId: { not: session.user.id },
          },
        });
        return { ...convo, unreadCount };
      })
    );

    return NextResponse.json(conversationsWithUnread);
  } catch (error) {
    console.error("Erreur API [GET_CONVERSATIONS]:", error);
    return new NextResponse('Erreur Interne du Serveur', { status: 500 });
  }
}

