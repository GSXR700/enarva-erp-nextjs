// app/api/tracking/employees/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const trackedEmployees = await prisma.user.findMany({
      where: {
        // CORRECTION : Suppression de la condition `isOnline: true`.
        // Nous affichons maintenant tout utilisateur qui a des coordonnées valides.
        currentLatitude: { not: null },
        currentLongitude: { not: null },
      },
      select: {
        id: true,
        name: true,
        image: true,
        currentLatitude: true,
        currentLongitude: true,
        lastSeen: true,
      },
    });

    return NextResponse.json(trackedEmployees);
  } catch (error) {
    console.error("Erreur API [GET_TRACKED_EMPLOYEES]:", error);
    return new NextResponse('Erreur Interne du Serveur', { status: 500 });
  }
}