import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Début du nettoyage de la base de données...');

  // L'ordre est important pour respecter les relations
  await prisma.deliveryNote.deleteMany({});
  console.log('Bons de livraison supprimés.');

  await prisma.invoice.deleteMany({});
  console.log('Factures supprimées.');

  await prisma.order.deleteMany({});
  console.log('Commandes supprimées.');

  await prisma.quote.deleteMany({});
  console.log('Devis supprimés.');

  await prisma.product.deleteMany({});
  console.log('Produits supprimés.');

  await prisma.client.deleteMany({});
  console.log('Clients supprimés.');
  
  await prisma.user.deleteMany({});
  console.log('Utilisateurs supprimés.');

  await prisma.companyInfo.deleteMany({});
  console.log('Informations de la société supprimées.');

  console.log('Nettoyage de la base de données terminé avec succès.');
}

main()
  .catch((e) => {
    console.error("Une erreur est survenue pendant le nettoyage:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });