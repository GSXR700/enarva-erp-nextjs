// app/administration/leads/components/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./CellAction";
import { LeadWithAssignedUser } from "./LeadsPageClient";
import { StatusSelector } from "./StatusSelector";
import { UserAvatar } from "../../components/UserAvatar";
import { 
    Phone, Globe, Users, Handshake, 
    Smartphone, Megaphone, Tv, Newspaper, Building
} from "lucide-react";
import { LeadCanal } from "@prisma/client";

// Fonction utilitaire pour formater les dates, gère les valeurs nulles
const formatDate = (date: Date | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

// --- NOUVELLE LOGIQUE : Catégorisation et mappage des icônes pour les canaux ---

// 1. Définir les catégories pour tous vos canaux de prospects
const canalCategories = {
  DIGITAL: [
    LeadCanal.WHATSAPP, 
    LeadCanal.FACEBOOK, 
    LeadCanal.INSTAGRAM, 
    LeadCanal.LINKEDIN, 
    LeadCanal.GOOGLE_MAPS, 
    LeadCanal.GOOGLE_SEARCH, 
    LeadCanal.SITE_WEB, 
    LeadCanal.FORMULAIRE_SITE, 
    LeadCanal.MARKETPLACE, 
    LeadCanal.YOUTUBE, 
    LeadCanal.EMAIL
  ],
  HUMAN_RELATIONS: [
    LeadCanal.APPORTEUR_AFFAIRES, 
    LeadCanal.COMMERCIAL_TERRAIN, 
    LeadCanal.SALON_PROFESSIONNEL, 
    LeadCanal.PARTENARIAT, 
    LeadCanal.RECOMMANDATION_CLIENT, 
    LeadCanal.VISITE_BUREAU, 
    LeadCanal.EMPLOYE_ENARVA,
    LeadCanal.PORTE_A_PORTE
  ],
  PHONE_CONTACT: [
    LeadCanal.APPEL_TELEPHONIQUE, 
    LeadCanal.SMS, 
    LeadCanal.NUMERO_SUR_PUB
  ],
  ADVERTISING: [
    LeadCanal.AFFICHE, 
    LeadCanal.FLYER, 
    LeadCanal.ENSEIGNE, 
    LeadCanal.VOITURE_SIGLEE, 
    LeadCanal.RADIO, 
    LeadCanal.ANNONCE_PRESSE, 
    LeadCanal.TELE
  ],
  OTHER: [
    LeadCanal.MANUEL, 
    LeadCanal.SOURCING_INTERNE, 
    LeadCanal.CHANTIER_EN_COURS
  ]
};

// 2. Mapper chaque catégorie à une icône et une infobulle
const iconForCategory: { [key: string]: { icon: React.FC<any>; title: string } } = {
  DIGITAL: { icon: Globe, title: "Canal Digital (Web, Réseaux Sociaux, Email...)" },
  HUMAN_RELATIONS: { icon: Users, title: "Relationnel (Partenaire, Recommandation...)" },
  PHONE_CONTACT: { icon: Phone, title: "Contact Téléphonique (Appel, SMS...)" },
  ADVERTISING: { icon: Megaphone, title: "Publicité (Flyer, Affiche...)" },
  OTHER: { icon: Handshake, title: "Autre (Manuel, Sourcing...)" },
  DEFAULT: { icon: Building, title: "Canal non spécifié" },
};

// 3. Composant pour afficher l'icône de la catégorie
const CanalIcon = ({ canal }: { canal: LeadCanal }) => {
    const iconProps = { className: "h-5 w-5 text-gray-500 dark:text-dark-subtle" };
    let category = "DEFAULT";

    for (const cat in canalCategories) {
        if ((canalCategories as any)[cat].includes(canal)) {
            category = cat;
            break;
        }
    }

    const { icon: IconComponent, title } = iconForCategory[category];

    return (
        <span title={title}>
            <IconComponent {...iconProps} />
        </span>
    );
};

// --- FIN DE LA NOUVELLE LOGIQUE ---


export const leadColumns: ColumnDef<LeadWithAssignedUser>[] = [
    {
      accessorKey: "nom",
      header: "Nom",
    },
    {
      accessorKey: "telephone",
      header: "Numéro téléphone",
    },
    {
      accessorKey: "quoteObject",
      header: "Services demandés",
      cell: ({ row }) => <span className="block w-40 truncate">{row.original.quoteObject}</span>
    },
    {
      accessorKey: "statut",
      header: "Statuts",
      cell: ({ row }) => <StatusSelector lead={row.original} />,
    },
    {
      accessorKey: "date_creation",
      header: "Date de création",
      cell: ({ row }) => formatDate(row.original.date_creation),
    },
    {
      accessorKey: "date_intervention",
      header: "Date d'intervention",
      cell: ({ row }) => formatDate(row.original.date_intervention),
    },
    {
      accessorKey: "date_cloture",
      header: "Date de clôture",
      cell: ({ row }) => formatDate(row.original.date_cloture),
    },
    {
        accessorKey: "canal",
        header: "Canal",
        cell: ({ row }) => <div className="flex justify-center"><CanalIcon canal={row.original.canal} /></div>
    },
    {
      accessorKey: "assignedTo",
      header: "Responsable",
      cell: ({ row }) => {
        const user = row.original.assignedTo;
        return user ? (
            <div className="flex items-center gap-2" title={user.name ?? "Utilisateur"}>
                <UserAvatar src={user.image} name={user.name} size={24} />
                <span className="truncate hidden sm:inline-block text-gray-800 dark:text-white">{user.name}</span>
            </div>
        ) : <span className="text-xs text-center text-gray-500 dark:text-dark-subtle block">N/A</span>;
      }
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => <div className="flex justify-end"><CellAction data={row.original} /></div>,
    },
];