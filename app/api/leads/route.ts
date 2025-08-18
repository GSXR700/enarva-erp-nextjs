// app/api/leads/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

/**
 * POST /api/leads - Créer un nouveau lead
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return new NextResponse("Accès non autorisé", { status: 403 });
    }

    const body = await req.json();
    const { 
      nom, 
      telephone, 
      email, 
      canal, 
      statut, 
      type, 
      source, 
      commentaire, 
      quoteObject,
      assignedToId,
      subcontractorAsSourceId,
      date_intervention,
      date_cloture
    } = body;

    if (!nom) {
      return new NextResponse("Le nom du prospect est requis", { status: 400 });
    }

    const newLead = await prisma.lead.create({
      data: {
        nom,
        telephone,
        email,
        canal,
        statut,
        type,
        source,
        commentaire,
        quoteObject,
        assignedToId: assignedToId || null,
        subcontractorAsSourceId: subcontractorAsSourceId || null,
        date_intervention: date_intervention ? new Date(date_intervention) : null,
        date_cloture: date_cloture ? new Date(date_cloture) : null,
      },
      include: {
        assignedTo: {
          select: { name: true, image: true }
        },
        subcontractorAsSource: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json(newLead, { status: 201 });
  } catch (error) {
    console.error("[LEADS_POST_ERROR]", error);
    return new NextResponse("Erreur Interne du Serveur", { status: 500 });
  }
}

/**
 * GET /api/leads - Récupérer tous les leads (pour API externe si nécessaire)
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Accès non autorisé", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        skip,
        take: limit,
        orderBy: {
          date_creation: 'desc',
        },
        include: {
          assignedTo: {
            select: {
              name: true,
              image: true,
            }
          },
          subcontractorAsSource: {
            select: {
              name: true
            }
          }
        }
      }),
      prisma.lead.count()
    ]);

    return NextResponse.json({
      data: leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("[LEADS_GET_ERROR]", error);
    return new NextResponse("Erreur Interne du Serveur", { status: 500 });
  }
}
