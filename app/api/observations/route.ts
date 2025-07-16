// app/api/observations/route.ts
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ObservationType } from '@prisma/client';

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const missionId = searchParams.get('missionId');
  const content = searchParams.get('content');
  const fileName = searchParams.get('filename');

  if (!missionId || !content || !fileName || !request.body) {
    return NextResponse.json({ error: 'Données manquantes.' }, { status: 400 });
  }

  try {
    // 1. Uploader le fichier sur Vercel Blob
    const blob = await put(fileName, request.body, {
      access: 'public',
    });

    // 2. Enregistrer l'observation dans la base de données
    await prisma.observation.create({
      data: {
        missionId: missionId,
        type: ObservationType.INFO, // Ou à rendre dynamique
        content: content,
        mediaUrl: blob.url, // On stocke l'URL du fichier uploadé
        reportedAt: new Date(),
      },
    });

    return NextResponse.json({ message: "Observation enregistrée avec succès", url: blob.url });
  } catch (error) {
    console.error("Erreur lors de l'upload de l'observation:", error);
    return NextResponse.json({ error: "Erreur lors de l'upload." }, { status: 500 });
  }
}