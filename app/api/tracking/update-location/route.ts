// app/api/tracking/update-location/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Schéma de validation pour les données de localisation
const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().positive().optional(),
  timestamp: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    console.log("📍 API: Received location update request");

    // Vérification de l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log("❌ API: No authenticated session");
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Validation des données reçues
    const body = await request.json();
    const validationResult = locationSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.log("❌ API: Invalid location data:", validationResult.error);
      return NextResponse.json(
        { error: "Données de localisation invalides", details: validationResult.error },
        { status: 400 }
      );
    }

    const { latitude, longitude, accuracy, timestamp } = validationResult.data;

    // Trouver l'utilisateur et son profil employé
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true, 
        currentLatitude: true,
        currentLongitude: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            missions: {
              where: {
                status: {
                  in: ['PENDING', 'IN_PROGRESS', 'APPROBATION']
                }
              },
              select: {
                id: true,
                title: true,
                status: true,
                scheduledStart: true,
                scheduledEnd: true,
                actualStart: true,
                actualEnd: true,
                order: {
                  select: {
                    id: true,
                    orderNumber: true,
                    client: {
                      select: {
                        id: true,
                        nom: true,
                        adresse: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user || !user.employee) {
      console.log(`❌ API: No user or employee found for user ${session.user.id}`);
      return NextResponse.json(
        { error: "Profil utilisateur ou employé introuvable" },
        { status: 404 }
      );
    }

    // Calculer la distance si on a une position précédente
    let distanceMoved = 0;
    if (user.currentLatitude && user.currentLongitude) {
      const R = 6371e3; // Rayon de la Terre en mètres
      const φ1 = user.currentLatitude * Math.PI/180;
      const φ2 = latitude * Math.PI/180;
      const Δφ = (latitude - user.currentLatitude) * Math.PI/180;
      const Δλ = (longitude - user.currentLongitude) * Math.PI/180;

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      distanceMoved = R * c;
    }

    console.log(`📏 API: User ${user.id} moved ${distanceMoved.toFixed(2)}m`);

    // Mettre à jour la position de l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        currentLatitude: latitude,
        currentLongitude: longitude,
        lastSeen: new Date()
      },
      select: {
        id: true,
        name: true,
        image: true,
        currentLatitude: true,
        currentLongitude: true,
        lastSeen: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            missions: {
              where: {
                status: {
                  in: ['PENDING', 'IN_PROGRESS', 'APPROBATION']
                }
              },
              select: {
                id: true,
                title: true,
                status: true,
                scheduledStart: true,
                scheduledEnd: true,
                actualStart: true,
                actualEnd: true,
                order: {
                  select: {
                    id: true,
                    orderNumber: true,
                    client: {
                      select: {
                        id: true,
                        nom: true,
                        adresse: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // Préparer les données pour la diffusion WebSocket
    const broadcastData = {
      id: updatedUser.employee!.id,
      name: updatedUser.employee!.firstName && updatedUser.employee!.lastName 
        ? `${updatedUser.employee!.firstName} ${updatedUser.employee!.lastName}` 
        : updatedUser.name || 'Employé',
      image: updatedUser.image,
      currentLatitude: updatedUser.currentLatitude,
      currentLongitude: updatedUser.currentLongitude,
      lastSeen: updatedUser.lastSeen,
      missions: updatedUser.employee!.missions.map(mission => ({
        id: mission.id,
        title: mission.title,
        status: mission.status,
        scheduledStart: mission.scheduledStart,
        scheduledEnd: mission.scheduledEnd,
        actualStart: mission.actualStart,
        actualEnd: mission.actualEnd,
        order: mission.order
      }))
    };

    // Diffuser la mise à jour via WebSocket aux administrateurs connectés
    // Note: Cette partie nécessite l'intégration avec votre système WebSocket existant
    // Vous pouvez utiliser votre contexte de notifications existant
    
    console.log(`✅ API: Location updated for user ${user.id}`);
    console.log(`📍 API: New position: ${latitude}, ${longitude}`);

    return NextResponse.json({
      success: true,
      message: "Localisation mise à jour avec succès",
      data: {
        latitude,
        longitude,
        accuracy,
        distanceMoved: distanceMoved.toFixed(2),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("❌ API: Error updating location:", error);
    return NextResponse.json(
      { 
        error: "Erreur serveur lors de la mise à jour de la localisation",
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// Endpoint GET pour récupérer la position actuelle (optionnel)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        currentLatitude: true,
        currentLongitude: true,
        lastSeen: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      latitude: user.currentLatitude,
      longitude: user.currentLongitude,
      lastSeen: user.lastSeen
    });

  } catch (error) {
    console.error("❌ API: Error fetching current location:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}