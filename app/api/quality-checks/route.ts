// app/api/quality-checks/route.ts
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { MissionStatus } from '@prisma/client';

export async function POST(request: Request): Promise<NextResponse> {
  const formData = await request.formData();
  const missionId = formData.get('missionId') as string;
  const clientId = formData.get('clientId') as string;
  const checklist = formData.get('checklist') as string;
  const score = parseInt(formData.get('score') as string, 10);
  const signature = formData.get('signature') as File;
  const photos = formData.getAll('photos') as File[];

  if (!missionId || !clientId || !checklist || isNaN(score) || !signature) {
    return NextResponse.json({ error: 'Données manquantes ou invalides.' }, { status: 400 });
  }

  try {
    // 1. Upload de la signature
    const signatureBlob = await put(`signatures/${missionId}-signature.png`, signature, {
      access: 'public',
    });

    // 2. Upload des photos
    const photoBlobs = await Promise.all(
      photos.map(file => put(`photos/${missionId}-${file.name}`, file, {
        access: 'public',
      }))
    );
    const photoUrls = photoBlobs.map(blob => blob.url);

    // 3. Enregistrement en base de données
    await prisma.qualityCheck.create({
      data: {
        missionId,
        clientId,
        checklist,
        score,
        clientSignatureUrl: signatureBlob.url,
        photosUrls: photoUrls,
        checkedAt: new Date(),
      },
    });

    // 4. Mettre à jour le statut de la mission à "COMPLETED"
    await prisma.mission.update({
        where: { id: missionId },
        data: { status: MissionStatus.COMPLETED }
    });

    return NextResponse.json({ success: true, message: 'Contrôle qualité enregistré.' });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du contrôle qualité:", error);
    return NextResponse.json({ error: "Erreur lors de l'enregistrement." }, { status: 500 });
  }
}