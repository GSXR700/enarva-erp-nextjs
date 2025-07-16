// scripts/seed-services.ts

import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

// Initialisation du client Prisma avec le logging activé pour le debug
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

// Type pour les services à créer
type ServiceInput = {
  name: string;
  family: string;
  description: string;
};

const servicesToCreate: ServiceInput[] = [
  // Famille : Nettoyage
  {
    name: 'Mise à disposition d’agents d’entretien',
    family: 'Nettoyage',
    description: 'Fourniture de personnel formé pour le nettoyage résidentiel ou professionnel (ponctuel ou régulier).',
  },
  {
    name: 'Grand Ménage',
    family: 'Nettoyage',
    description: 'Nettoyage complet et approfondi de l’habitat ou du bureau, sol, murs, vitres, mobilier.',
  },
  {
    name: 'Nettoyage de Fin de Chantier',
    family: 'Nettoyage',
    description: 'Nettoyage professionnel après travaux ou rénovations, enlèvement des résidus de chantier.',
  },
  {
    name: 'Nettoyage de Tapis',
    family: 'Nettoyage',
    description: 'Shampoing, extraction ou nettoyage vapeur de tapis domestiques ou professionnels.',
  },
  {
    name: 'Nettoyage de Canapés & Matelas',
    family: 'Nettoyage',
    description: 'Traitement hygiénique et anti-acariens des matelas, fauteuils et canapés.',
  },
  {
    name: 'Nettoyage de Vitres',
    family: 'Nettoyage',
    description: 'Nettoyage intérieur et extérieur de toutes surfaces vitrées, y compris en hauteur.',
  },
  {
    name: 'Nettoyage de Four',
    family: 'Nettoyage',
    description: 'Nettoyage technique et dégraissage à la vapeur des fours domestiques ou professionnels.',
  },

  // Famille : Hygiène (Traitement Antinuisible)
  {
    name: 'Désinfection (Traitement 4D)',
    family: 'Hygiène',
    description: 'Élimination des virus, bactéries et champignons sur toutes les surfaces.',
  },
  {
    name: 'Désinsectisation (Traitement 4D)',
    family: 'Hygiène',
    description: 'Éradication des insectes nuisibles (cafards, puces, moustiques, fourmis, etc.).',
  },
  {
    name: 'Dératisation (Traitement 4D)',
    family: 'Hygiène',
    description: 'Élimination des rats et souris à l’aide de dispositifs mécaniques et produits adaptés.',
  },
  {
    name: 'Dépigeonnage (Traitement 4D)',
    family: 'Hygiène',
    description: 'Éloignement des pigeons par dispositifs répulsifs ou filetages adaptés.',
  },

  // Famille : Traitement des Sols
  {
    name: 'Cristallisation du Marbre',
    family: 'Traitement des Sols',
    description: 'Traitement professionnel pour restaurer la brillance et protéger le marbre.',
  },
  {
    name: 'Entretien du Parquet',
    family: 'Traitement des Sols',
    description: 'Nettoyage, huilage ou vitrification selon l’essence de bois et son usage.',
  },
  {
    name: 'Entretien de la Pierre Naturelle',
    family: 'Traitement des Sols',
    description: 'Traitement doux et détergents spécifiques pour les pierres calcaires, granits, etc.',
  },
  {
    name: 'Nettoyage de Sols Carrelés',
    family: 'Traitement des Sols',
    description: 'Nettoyage en profondeur des carreaux, joints inclus, avec monobrosse ou vapeur.',
  },
  {
    name: 'Décapage & Remise en État de Sols PVC/Lino',
    family: 'Traitement des Sols',
    description: 'Décapage, rinçage et application d’émulsion protectrice sur sols souples.',
  },
  {
    name: 'Traitement Anti-Taches pour Béton Ciré',
    family: 'Traitement des Sols',
    description: 'Application de traitements hydrofuges et oléofuges adaptés au béton ciré.',
  },

  // Famille : Piscine
  {
    name: 'Entretien de Piscine',
    family: 'Piscine',
    description: 'Contrôle du pH, nettoyage manuel, filtration, traitement de l’eau.',
  },

  // Famille : Jardinage
  {
    name: 'Tonte de Gazon',
    family: 'Jardinage',
    description: 'Tonte manuelle ou mécanique des pelouses avec ramassage.',
  },
  {
    name: 'Taille de Haies & Arbustes',
    family: 'Jardinage',
    description: 'Taille esthétique ou d’entretien des haies et végétaux structurés.',
  },
  {
    name: 'Désherbage Manuel ou Chimique',
    family: 'Jardinage',
    description: 'Élimination des mauvaises herbes en allées, massifs ou pelouses.',
  },
  {
    name: 'Arrosage et Soins des Plantes',
    family: 'Jardinage',
    description: 'Entretien régulier : arrosage, apport d’engrais, traitements naturels.',
  },
  {
    name: 'Évacuation de Déchets Verts',
    family: 'Jardinage',
    description: 'Collecte et transport des déchets issus de l’entretien de jardin.',
  },
  {
    name: 'Aménagement Paysager Simple',
    family: 'Jardinage',
    description: 'Mise en place de plantes, galets, géotextiles, paillage décoratif…',
  },
];

async function main() {
  console.log('🌱 Début de la procédure de seeding des services...');

  try {
    // 1. Vérifier si le département existe déjà
    const department = await prisma.department.findFirst({
      where: { name: 'Service Opérations & Terrain' }
    });

    // 2. Créer le département s'il n'existe pas
    const operationsDepartment = department || await prisma.department.create({
      data: {
        name: 'Service Opérations & Terrain',
        description: 'Département responsable des opérations terrain et des services techniques'
      }
    });

    console.log(`✅ Département "${operationsDepartment.name}" prêt`);

    // 3. Supprimer les anciens services
    const deletedCount = await prisma.service.deleteMany({});
    console.log(`🗑️  ${deletedCount.count} anciens services supprimés`);

    // 4. Créer les nouveaux services
    const createdServices = await prisma.$transaction(
      servicesToCreate.map(service => 
        prisma.service.create({
          data: {
            name: service.name,
            family: service.family,
            description: service.description,
            departmentId: operationsDepartment.id
          }
        })
      )
    );

    console.log(`✨ ${createdServices.length} services créés avec succès`);
    
    // 5. Afficher un résumé par famille
    const families = [...new Set(createdServices.map(s => s.family))];
    for (const family of families) {
      const count = createdServices.filter(s => s.family === family).length;
      console.log(`📊 Famille "${family}": ${count} services`);
    }

  } catch (error) {
    console.error('❌ Erreur pendant le seeding:', error);
    throw error;
  }
}

// Exécution du script
main()
  .catch((e) => {
    console.error('❌ Erreur fatale:', e);
    process.exit(1);
  })
  .finally(async () => {
    console.log('🔄 Nettoyage des connexions...');
    await prisma.$disconnect();
  });