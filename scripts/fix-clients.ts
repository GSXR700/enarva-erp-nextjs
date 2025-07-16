// scripts/fix-clients.ts
import prisma from '../lib/prisma'; // Assurez-vous que le chemin vers prisma est correct

async function findCorruptClients() {
  console.log("Recherche des clients corrompus (ceux avec un nom manquant)...");

  try {
    // CORRECTION : On type correctement le résultat comme 'unknown' puis on le caste.
    const rawResult: unknown = await prisma.client.findRaw({
      filter: { nom: null } 
    });

    // On s'assure que le résultat est bien un tableau avant de continuer.
    if (!Array.isArray(rawResult)) {
        console.log("Le résultat de la base de données n'est pas un tableau. Impossible de continuer.");
        return;
    }

    const corruptClients: any[] = rawResult;

    if (corruptClients.length === 0) {
      console.log("🎉 Bonne nouvelle ! Aucun client corrompu n'a été trouvé.");
      return;
    }

    console.log(`❌ Problème trouvé ! ${corruptClients.length} client(s) ont un nom manquant.`);
    console.log("Voici leurs IDs :");
    corruptClients.forEach(client => {
      // Dans une requête brute, l'ID est dans `_id` et est un objet. On le convertit en string.
      console.log(`- ID: ${client._id.$oid}`); 
    });

    console.log("\n---");
    console.log("Action recommandée : Supprimez ces clients depuis votre interface MongoDB Compass ou Atlas,");
    console.log("ou contactez un administrateur pour nettoyer ces entrées invalides.");
    console.log("Une fois ces clients supprimés, l'application fonctionnera correctement.");

  } catch (error) {
    console.error("Une erreur s'est produite lors de la recherche des clients :", error);
  } finally {
    await prisma.$disconnect();
  }
}

findCorruptClients();