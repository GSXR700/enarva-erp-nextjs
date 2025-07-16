// app/api/chat/messages/read/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { conversationId, recipientId } = await request.json();

    // Mettre à jour tous les messages non lus de cette conversation
    await prisma.message.updateMany({
      where: {
        conversationId: conversationId,
        senderId: recipientId, // Uniquement les messages de l'autre personne
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    // Envoyer un événement au socket pour informer l'autre utilisateur que ses messages ont été lus
    await fetch(`${process.env.NEXTAUTH_URL}/api/socket/emit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room: recipientId,
          event: 'messages-read',
          data: { conversationId },
        }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur API [MARK_MESSAGES_READ]:", error);
    return new NextResponse('Erreur Interne du Serveur', { status: 500 });
  }
}