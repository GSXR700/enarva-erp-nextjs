// enarva-nextjs-dashboard-app/app/api/notifications/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      // La ligne la plus importante : on inclut les données de l'expéditeur
      include: {
        sender: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Erreur API [GET_NOTIFICATIONS]:", error);
    return new NextResponse('Erreur Interne du Serveur', { status: 500 });
  }
}
