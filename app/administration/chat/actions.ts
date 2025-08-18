// app/administration/chat/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function startOrGetConversation(recipientId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Non autorisé" };
  }
  const currentUserId = session.user.id;

  // Sécurité : ne pas autoriser un utilisateur à démarrer une conversation avec lui-même
  if (currentUserId === recipientId) {
    return { success: false, error: "Action non autorisée" };
  }

  // Vérifier si une conversation existe déjà entre ces deux utilisateurs
  let conversation = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participantIDs: { has: currentUserId } },
        { participantIDs: { has: recipientId } },
      ],
    },
  });

  // Si aucune conversation n'existe, en créer une nouvelle
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        participantIDs: [currentUserId, recipientId],
      },
    });
  }

  // Rafraîchir la page du chat pour afficher la nouvelle conversation dans la liste
  revalidatePath('/administration/chat');
  return { success: true, conversationId: conversation.id };
}
