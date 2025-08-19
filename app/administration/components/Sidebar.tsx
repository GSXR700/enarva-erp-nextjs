"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, FileText, Receipt, Settings, Briefcase,
  Calendar, Warehouse, Users2, CreditCard, Download, Wallet, MapPin, Truck,
  ShoppingBag, Handshake, Wrench, LucideIcon, Contact, LogOut
} from "lucide-react";
import { Role } from "@prisma/client";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
  userRole?: Role;
}

// Nouvelle structure de menu : plate avec des séparateurs de type 'header'
const menuItems: ({
    type: 'link';
    name: string;
    href: string;
    icon: React.ReactElement<LucideIcon>;
    roles?: Role[];
} | {
    type: 'header';
    name: string;
    roles?: Role[];
})[] = [
    { type: 'link', name: 'Tableau de Bord', href: '/administration', icon: <LayoutDashboard size={18} /> },
    { type: 'header', name: 'Opérations', roles: ['ADMIN', 'MANAGER'] },
    { type: 'link', name: 'Planning', href: '/administration/planning', icon: <Calendar size={18} />, roles: ['ADMIN', 'MANAGER'] },
    { type: 'link', name: 'Suivi Temps Réel', href: '/administration/tracking', icon: <MapPin size={18} />, roles: ['ADMIN', 'MANAGER'] },
    { type: 'link', name: 'Missions', href: '/administration/missions', icon: <Briefcase size={18} />, roles: ['ADMIN', 'MANAGER'] },
    { type: 'header', name: 'Ventes & CRM', roles: ['ADMIN', 'MANAGER'] },
    { type: 'link', name: 'Prospects', href: '/administration/leads', icon: <Contact size={18} />, roles: ['ADMIN', 'MANAGER'] },
    { type: 'link', name: 'Clients', href: '/administration/clients', icon: <Users size={18} />, roles: ['ADMIN', 'MANAGER'] },
    { type: 'link', name: 'Devis', href: '/administration/quotes', icon: <FileText size={18} />, roles: ['ADMIN', 'MANAGER'] },
    { type: 'header', name: 'Finance & Achats', roles: ['ADMIN', 'MANAGER', 'FINANCE'] },
    { type: 'link', name: 'Factures', href: '/administration/invoices', icon: <Receipt size={18} />, roles: ['ADMIN', 'MANAGER', 'FINANCE'] },
    { type: 'link', name: 'Dépenses', href: '/administration/expenses', icon: <Wallet size={18} />, roles: ['ADMIN', 'MANAGER', 'FINANCE'] },
    { type: 'link', name: 'Fournisseurs', href: '/administration/suppliers', icon: <ShoppingBag size={18} />, roles: ['ADMIN', 'MANAGER', 'FINANCE'] },
    { type: 'link', name: 'Reporting', href: '/administration/reporting', icon: <Download size={18} />, roles: ['ADMIN', 'MANAGER', 'FINANCE'] },
    { type: 'header', name: 'Ressources', roles: ['ADMIN', 'MANAGER'] },
    { type: 'link', name: 'Employés', href: '/administration/employees', icon: <Users2 size={18} />, roles: ['ADMIN', 'MANAGER'] },
    { type: 'link', name: 'Paie', href: '/administration/payroll', icon: <CreditCard size={18} />, roles: ['ADMIN', 'MANAGER'] },
    { type: 'link', 'name': 'Équipements', href: '/administration/equipments', icon: <Wrench size={18} />, roles: ['ADMIN', 'MANAGER'] },
    { type: 'link', name: 'Produits', href: '/administration/products', icon: <Warehouse size={18} />, roles: ['ADMIN', 'MANAGER'] },
    { type: 'link', name: 'Sous-traitants', href: '/administration/subcontractors', icon: <Handshake size={18} />, roles: ['ADMIN', 'MANAGER'] },
    { type: 'link', name: 'Bons de Livraison', href: '/administration/delivery-notes', icon: <Truck size={18} />, roles: ['ADMIN', 'MANAGER'] },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen, userRole }: SidebarProps) => {
  const pathname = usePathname();
  const sidebar = useRef<HTMLDivElement>(null);

  // Gère la fermeture de la sidebar en cliquant à l'extérieur sur mobile
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !sidebarOpen || sidebar.current.contains(target as Node)) return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, [sidebarOpen, setSidebarOpen]);

  return (
    <>
      {/* Overlay pour la vue mobile */}
      <div
        className={cn(
          "fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity duration-200 lg:hidden",
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
      ></div>

      <aside
        ref={sidebar}
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-72 flex-col overflow-y-hidden bg-white shadow-lg duration-300 ease-in-out dark:bg-dark-surface",
          "lg:static lg:translate-x-0", // La sidebar est toujours visible et de taille fixe sur desktop
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-center px-6 shrink-0 border-b border-gray-100 dark:border-dark-border">
          <Link href="/administration">
            <Image className="dark:hidden" width={120} height={35} src="/images/light-logo.png" alt="Logo" priority />
            <Image className="hidden dark:block" width={120} height={35} src="/images/dark-logo.png" alt="Logo" priority />
          </Link>
        </div>

        {/* Liens de navigation */}
        <div className="no-scrollbar flex flex-1 flex-col overflow-y-auto">
          <nav className="flex-1 mt-4 px-4 space-y-1">
            {menuItems.map((item, index) => {
              // Vérification des rôles
              if (item.roles && userRole && !item.roles.includes(userRole)) {
                return null;
              }

              // Affiche un titre de section
              if (item.type === 'header') {
                return (
                  <h3 key={index} className="px-3 pt-4 pb-1 text-xs font-semibold uppercase text-gray-400 dark:text-dark-subtle">
                    {item.name}
                  </h3>
                );
              }
              
              // Affiche un lien
              const isActive = pathname === item.href || (item.href !== '/administration' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={index}
                  href={item.href}
                  onClick={() => sidebarOpen && setSidebarOpen(false)} // Ferme la sidebar sur clic mobile
                  className={cn(
                    "group flex items-center gap-3 rounded-md p-3 text-sm font-medium duration-200 ease-in-out",
                    isActive
                      ? "bg-primary-light text-primary dark:bg-dark-highlight-bg dark:text-white"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-highlight-bg"
                  )}
                >
                  {item.icon}
                  <span className="whitespace-nowrap">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Section Réglages et Déconnexion en bas */}
          <div className="mt-auto p-4 space-y-2 border-t border-gray-100 dark:border-dark-border">
             <Link
                href="/administration/settings"
                className={cn(
                    "group flex items-center gap-3 rounded-md p-3 text-sm font-medium duration-200 ease-in-out",
                    pathname.startsWith('/administration/settings')
                      ? "bg-primary-light text-primary dark:bg-dark-highlight-bg dark:text-white"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-highlight-bg"
                )}
             >
                <Settings size={18} />
                <span>Réglages</span>
             </Link>
             <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="group flex w-full items-center gap-3 rounded-md p-3 text-sm font-medium duration-200 ease-in-out text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-highlight-bg"
             >
                <LogOut size={18} />
                <span>Déconnexion</span>
             </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;