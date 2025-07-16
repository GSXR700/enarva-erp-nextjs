// app/administration/leads/actions.ts

"use server";

import prisma from "@/lib/prisma";
import { unstable_noStore as noStore } from 'next/cache';

// Nombre d'éléments à afficher par page pour la pagination
const ITEMS_PER_PAGE = 10;

/**
 * Récupère une liste paginée de prospects avec les informations de l'utilisateur assigné.
 * Conforme au schéma v6.0.
 * @param page - Le numéro de la page actuelle.
 * @returns Un objet contenant les données des leads, le nombre total, et des indicateurs de pagination.
 */
export async function getLeads(page: number = 1) {
  noStore(); // Empêche la mise en cache pour toujours avoir les données à jour
  try {
    const skip = (page - 1) * ITEMS_PER_PAGE;

    // Exécute les deux requêtes en parallèle pour optimiser les performances
    const [data, total] = await prisma.$transaction([
      prisma.lead.findMany({
        skip,
        take: ITEMS_PER_PAGE,
        include: {
          assignedTo: {
            select: { name: true, image: true },
          },
        },
        orderBy: {
          // Tri par le nouveau champ de date défini dans le schéma
          date_creation: "desc", 
        },
      }),
      prisma.lead.count(),
    ]);

    return {
        data: JSON.parse(JSON.stringify(data)),
        total,
        hasNextPage: (page * ITEMS_PER_PAGE) < total,
        hasPrevPage: page > 1,
    };

  } catch (error) {
    console.error("Échec de la récupération des leads:", error);
    return { data: [], total: 0, hasNextPage: false, hasPrevPage: false };
  }
}

/**
 * Récupère une liste d'utilisateurs (limités aux rôles pouvant être assignés) 
 * pour les utiliser dans les formulaires.
 * @returns Une liste d'utilisateurs avec id, nom et image.
 */
export async function getUsersForAssignment() {
    noStore();
    try {
        const users = await prisma.user.findMany({
            where: {
                role: { in: ['ADMIN', 'MANAGER', 'FIELD_WORKER'] } // Rôles pouvant être responsables d'un lead
            },
            select: { id: true, name: true, image: true }
        });
        return JSON.parse(JSON.stringify(users));
    } catch (error) {
        console.error("Échec de la récupération des utilisateurs:", error);
        return [];
    }
}