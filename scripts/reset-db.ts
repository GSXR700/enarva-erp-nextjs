// scripts/reset-db.ts
import prisma from '../lib/prisma';

async function resetDatabase() {
  console.log("🔥 Début du nettoyage COMPLET et DÉFINITIF des collections...");

  try {
    // La transaction garantit que tout est supprimé, ou rien ne l'est.
    await prisma.$transaction([
      // --- ÉTAPE 1: Suppression des modèles les plus dépendants ---
      prisma.attachment.deleteMany({}),
      prisma.observation.deleteMany({}),
      prisma.timeLog.deleteMany({}),
      prisma.qualityCheck.deleteMany({}),
      prisma.maintenanceTicket.deleteMany({}),
      prisma.prestation.deleteMany({}),
      prisma.invoice.deleteMany({}),
      prisma.deliveryNote.deleteMany({}), // On supprime les BL avant les Commandes
      
      // --- ÉTAPE 2: Suppression des modèles parents ---
      prisma.mission.deleteMany({}), // Les Missions dépendent des Commandes
      prisma.order.deleteMany({}),   // Les Commandes dépendent des Devis
      prisma.quote.deleteMany({}),   // Les Devis dépendent des Clients

      // --- ÉTAPE 3: Nettoyage des relations restantes avant la suppression finale ---
      prisma.payment.deleteMany({}),
      prisma.payAdvance.deleteMany({}),
      prisma.payroll.deleteMany({}),
      prisma.lead.updateMany({
        where: { client_id: { not: null } },
        data: { 
            client_id: null,
            converti_en_client: false,
            statut: 'new_lead'
        },
      }),
      
      // --- ÉTAPE 4: Suppression des modèles principaux ---
      prisma.client.deleteMany({}),
    ]);

    console.log("✅ Nettoyage définitif terminé avec succès.");
    console.log("Les collections métier ont été vidées dans l'ordre correct et sans erreur.");

  } catch (error) {
    console.error("❌ Une erreur est survenue pendant le nettoyage :", error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();