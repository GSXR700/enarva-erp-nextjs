// app/api/chat/messages/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createAndEmitNotification } from '@/lib/notificationService';
import { getIO } from '@/lib/socket';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { content, conversationId, recipientId } = body;

    if (!content || !conversationId || !recipientId) {
      return new NextResponse('Données manquantes', { status: 400 });
    }

    const newMessage = await prisma.$transaction(async (tx) => {
      const createdMessage = await tx.message.create({
        data: {
          content,
          senderId: session.user.id,
          conversationId,
        },
        include: {
            sender: {
                select: { id: true, name: true, image: true }
            },
        }
      });
      await tx.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() }
      });
      return createdMessage;
    });

    // 🔧 CORRECTION : Vérification de sécurité pour getIO()
    try {
      const io = getIO();
      if (io) {
        // Au destinataire
        io.to(recipientId).emit('new-message', newMessage);
        // À l'expéditeur (pour synchroniser ses autres sessions/onglets)
        io.to(session.user.id).emit('new-message', newMessage);
      } else {
        console.warn("[SOCKET_EMIT] Socket.IO non disponible - messages non émis en temps réel");
      }
    } catch(e) {
      console.error("[SOCKET_EMIT] Échec de l'émission 'new-message'", e);
    }
    
    // La notification est aussi envoyée via émission directe
    await createAndEmitNotification({
        userId: recipientId,
        message: `<b>${session.user.name || 'Un utilisateur'}</b> vous a envoyé un message.`,
        link: `/administration/chat`,
        senderId: session.user.id
    });

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error("Erreur API [POST_MESSAGE]:", error);
    return new NextResponse('Erreur Interne du Serveur', { status: 500 });
  }
}