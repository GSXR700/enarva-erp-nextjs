// scripts/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // --- 1. Nettoyage des anciens départements (Optionnel mais recommandé) ---
  console.log('Deleting old departments...');
  await prisma.department.deleteMany({});
  console.log('Old departments deleted.');

  // --- 2. Création des nouveaux départements ---
  const departmentsToCreate = [
    {
      name: 'Direction Générale',
      description: `• Définition des stratégies globales\n• Validation des décisions clés\n• Gestion des partenariats stratégiques et représentation externe`
    },
    {
      name: 'Service Commercial & Relation Clients',
      description: `• Prospection commerciale\n• Qualification des leads entrants (WhatsApp, site web, etc.)\n• Gestion des devis et propositions commerciales\n• Suivi client et fidélisation\n• Gestion des commissions apporteurs d’affaires`
    },
    {
      name: 'Service Opérations & Terrain',
      description: `• Coordination et planification des interventions\n• Suivi terrain et gestion des bons d’intervention\n• Contrôle qualité des prestations réalisées\n• Gestion des équipements et des produits d’entretien`
    },
    {
      name: 'Service Administratif & Secrétariat',
      description: `• Gestion administrative des contrats\n• Édition et archivage des documents commerciaux\n• Gestion des réclamations et SAV\n• Organisation des visites sur place avant devis`
    },
    {
      name: 'Département Ressources Humaines',
      description: `• Recrutement et gestion du personnel\n• Gestion des contrats de travail\n• Gestion de la paie (journalier, avances, primes)\n• Formation du personnel`
    },
    {
      name: 'Département Financier & Comptabilité',
      description: `• Facturation clients (TTC et "en noir")\n• Suivi des paiements fournisseurs et sous-traitants\n• Gestion des coûts et des budgets\n• Suivi de la trésorerie`
    },
    {
      name: 'Département Achats & Logistique',
      description: `• Approvisionnement en produits et consommables\n• Achats et gestion du matériel professionnel\n• Gestion des stocks et inventaire`
    },
    {
      name: 'Département IT & Digitalisation',
      description: `• Développement et gestion de l'ERP/CRM\n• Automatisation des workflows\n• Maintenance et support technique\n• Gestion des outils digitaux`
    },
    {
      name: 'Département Marketing & Communication',
      description: `• Gestion du site web et des réseaux sociaux\n• Gestion des campagnes publicitaires digitales\n• Création de contenu promotionnel\n• Gestion de la réputation en ligne`
    },
    {
      name: 'Contrôle Qualité & Audit Interne',
      description: `• Contrôle régulier des interventions\n• Vérification de la conformité des documents\n• Analyse des retours clients\n• Recommandations d’amélioration`
    }
  ];

  console.log('Creating new departments...');
  for (const dept of departmentsToCreate) {
    await prisma.department.create({
      data: {
        name: dept.name,
        description: dept.description,
      },
    });
    console.log(`Created department: ${dept.name}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });