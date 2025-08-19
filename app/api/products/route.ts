import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await request.formData();
    const designation = formData.get('designation') as string;
    const pu_ht = parseFloat(formData.get('pu_ht') as string);

    if (!designation || !pu_ht) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        designation,
        pu_ht,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}