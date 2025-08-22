// app/api/tracking/employees/route.ts
// 🔧 RETOUR à la version originale qui fonctionnait + ajout debug
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔍 API: Starting tracking employees fetch...');
    
    const trackedEmployees = await prisma.user.findMany({
      where: {
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

    console.log(`📊 API: Found ${trackedEmployees.length} users with location`);
    console.log('📍 Users data:', trackedEmployees);

    return NextResponse.json(trackedEmployees);
  } catch (error) {
    console.error("❌ API Error [GET_TRACKED_EMPLOYEES]:", error);
    return new NextResponse('Erreur Interne du Serveur', { status: 500 });
  }
}