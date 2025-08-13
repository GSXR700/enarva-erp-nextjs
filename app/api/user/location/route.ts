// app/api/user/location/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../../auth/[...nextauth]/route';
import { getIO } from '@/lib/socket'; // Importer la fonction pour récupérer l'instance du socket

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { latitude, longitude } = await request.json();

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json({ error: 'Coordonnées invalides.' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        currentLatitude: latitude,
        currentLongitude: longitude,
        lastSeen: new Date(),
      },
    });

    // Émettre l'événement Socket.IO pour le temps réel
    try {
      const io = getIO();
      if (io) {
        // On envoie à une "room" générale 'admin-tracking' que les admins écouteront
        (io as any).to('admin-tracking').emit('location-update', {
          id: updatedUser.id,
          name: updatedUser.name,
          image: updatedUser.image,
          currentLatitude: updatedUser.currentLatitude,
          currentLongitude: updatedUser.currentLongitude,
          lastSeen: updatedUser.lastSeen,
        });
      } else {
        console.warn("[SOCKET_EMIT] Instance Socket.IO non disponible");
      }
    } catch (e) {
      console.error("[SOCKET_EMIT] Échec de l'émission 'location-update'", e);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Erreur API [UPDATE_LOCATION]:", error);
    return new NextResponse('Erreur Interne du Serveur', { status: 500 });
  }
}