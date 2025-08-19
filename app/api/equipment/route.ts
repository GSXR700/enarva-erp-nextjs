import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { EquipmentStatus } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const serialNumber = formData.get('serialNumber') as string || undefined;
    const purchaseDate = formData.get('purchaseDate') as string;
    const status = formData.get('status') as EquipmentStatus || 'IN_SERVICE';

    if (!name || !type) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const equipment = await prisma.equipment.create({
      data: {
        name,
        type,
        serialNumber,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
        status,
      },
    });

    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Error creating equipment:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}