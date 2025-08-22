// app/api/equipment/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

/**
 * POST /api/equipment - Créer un nouvel équipement
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return new NextResponse("Accès non autorisé", { status: 403 });
    }

    const body = await req.json();
    const { name, type, serialNumber, purchaseDate, status } = body;

    if (!name || !type) {
      return new NextResponse("Le nom et le type de l'équipement sont requis", { status: 400 });
    }

    // Vérifier si un équipement avec le même nom existe déjà
    const existingEquipment = await prisma.equipment.findFirst({
      where: { name }
    });

    if (existingEquipment) {
      return new NextResponse("Un équipement avec ce nom existe déjà", { status: 409 });
    }

    // Vérifier si un équipement avec le même numéro de série existe déjà (si fourni)
    if (serialNumber) {
      const existingSerial = await prisma.equipment.findFirst({
        where: { serialNumber }
      });

      if (existingSerial) {
        return new NextResponse("Un équipement avec ce numéro de série existe déjà", { status: 409 });
      }
    }

    const newEquipment = await prisma.equipment.create({
      data: {
        name,
        type,
        serialNumber: serialNumber || null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        status: status || 'IN_SERVICE',
      },
    });

    return NextResponse.json(newEquipment, { status: 201 });

  } catch (error) {
    console.error("[EQUIPMENT_POST_ERROR]", error);
    return new NextResponse("Erreur Interne du Serveur", { status: 500 });
  }
}

/**
 * GET /api/equipment - Récupérer la liste des équipements
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Accès non autorisé", { status: 401 });
    }

    const equipment = await prisma.equipment.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: {
            tickets: true
          }
        }
      }
    });

    return NextResponse.json(equipment);
  } catch (error) {
    console.error("[EQUIPMENT_GET_ERROR]", error);
    return new NextResponse("Erreur Interne du Serveur", { status: 500 });
  }
}