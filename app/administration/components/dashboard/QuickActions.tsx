"use client";

import Link from "next/link";
import { Plus, FileText, Users, Package, Receipt, Briefcase, UserPlus, Wrench } from "lucide-react";

export function QuickActions() {
  const actions = [
    { 
      icon: <FileText className="h-4 w-4 md:h-5 md:w-5" />, 
      label: "Nouveau Devis", 
      shortLabel: "Devis",
      href: "/administration/quotes/new", 
      color: "blue" 
    },
    { 
      icon: <UserPlus className="h-4 w-4 md:h-5 md:w-5" />, 
      label: "Nouveau Client", 
      shortLabel: "Client",
      href: "/administration/clients/new", 
      color: "green" 
    },
    { 
      icon: <Users className="h-4 w-4 md:h-5 md:w-5" />, 
      label: "Nouveau Prospect", 
      shortLabel: "Prospect",
      href: "/administration/leads/new", 
      color: "purple" 
    },
    { 
      icon: <Briefcase className="h-4 w-4 md:h-5 md:w-5" />, 
      label: "Nouvelle Mission", 
      shortLabel: "Mission",
      href: "/administration/missions/new", 
      color: "indigo" 
    },
    { 
      icon: <Package className="h-4 w-4 md:h-5 md:w-5" />, 
      label: "Nouveau Produit", 
      shortLabel: "Produit",
      href: "/administration/products/new", 
      color: "orange" 
    },
    { 
      icon: <Wrench className="h-4 w-4 md:h-5 md:w-5" />, 
      label: "Nouvel Équipement", 
      shortLabel: "Équipement",
      href: "/administration/equipment/new", 
      color: "red" 
    },
  ];

  return (
    <div className="bg-white dark:bg-dark-container p-3 md:p-4 rounded-2xl shadow-md">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Actions Rapides</h3>
      
      {/* Desktop: 3 columns, Mobile: 2 columns */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 md:gap-3">
        {actions.map((action, index) => (
          <Link
            key={index}
            href={action.href}
            className={`flex flex-col items-center justify-center p-3 md:p-4 rounded-xl border-2 border-dashed transition-all hover:scale-105 hover:shadow-lg min-h-[80px] md:min-h-[100px]
              ${action.color === 'blue' ? 'border-blue-300 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20' : ''}
              ${action.color === 'green' ? 'border-green-300 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20' : ''}
              ${action.color === 'purple' ? 'border-purple-300 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20' : ''}
              ${action.color === 'indigo' ? 'border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20' : ''}
              ${action.color === 'orange' ? 'border-orange-300 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20' : ''}
              ${action.color === 'red' ? 'border-red-300 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' : ''}
              dark:border-dark-border`}
          >
            <div className={`mb-2 p-2 rounded-lg
              ${action.color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' : ''}
              ${action.color === 'green' ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400' : ''}
             ${action.color === 'purple' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400' : ''}
             ${action.color === 'indigo' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : ''}
             ${action.color === 'orange' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400' : ''}
             ${action.color === 'red' ? 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400' : ''}`}
           >
             {action.icon}
           </div>
           {/* Show full label on desktop, short on mobile */}
           <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
             <span className="block md:hidden">{action.shortLabel}</span>
             <span className="hidden md:block">{action.label}</span>
           </span>
         </Link>
       ))}
     </div>
   </div>
 );
}