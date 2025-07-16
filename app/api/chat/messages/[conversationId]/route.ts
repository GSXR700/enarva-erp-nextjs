// app/api/chat/messages/[conversationId]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const messages = await prisma.message.findMany({
      where: {
        conversationId: params.conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Erreur API [GET_MESSAGES]:", error);
    return new NextResponse('Erreur Interne du Serveur', { status: 500 });
  }
}