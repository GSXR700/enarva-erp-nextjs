// app/api/notifications/[id]/read/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.notification.update({
      where: { id: params.id },
      data: { read: true },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse('Erreur Interne du Serveur', { status: 500 });
  }
}