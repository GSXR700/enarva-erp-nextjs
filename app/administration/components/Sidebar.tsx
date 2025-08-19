"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, FileText, Receipt, Settings, Briefcase,
  Calendar, Warehouse, Users2, CreditCard, Download, Wallet, MapPin, Truck,
  ShoppingBag, Handshake, Wrench, LucideIcon, Contact, LogOut, ChevronLeft
} from "lucide-react";
import { Role } from "@prisma/client";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
  userRole?: Role;
}

const menuItems: {
    name: string;
    href: string;
    icon: React.ReactElement<LucideIcon>;
    roles?: Role[];
}[] = [
    { name: 'Tableau de Bord', href: '/administration', icon: <LayoutDashboard size={18} /> },
    { name: 'Planning', href: '/administration/planning', icon: <Calendar size={18} />, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Suivi', href: '/administration/tracking', icon: <MapPin size={18} />, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Missions', href: '/administration/missions', icon: <Briefcase size={18} />, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Prospects', href: '/administration/leads', icon: <Contact size={18} />, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Clients', href: '/administration/clients', icon: <Users size={18} />, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Devis', href: '/administration/quotes', icon: <FileText size={18} />, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Factures', href: '/administration/invoices', icon: <Receipt size={18} />, roles: ['ADMIN', 'MANAGER', 'FINANCE'] },
    { name: 'Dépenses', href: '/administration/expenses', icon: <Wallet size={18} />, roles: ['ADMIN', 'MANAGER', 'FINANCE'] },
    { name: 'Employés', href: '/administration/employees', icon: <Users2 size={18} />, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Paie', href: '/administration/payroll', icon: <CreditCard size={18} />, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Équipements', href: '/administration/equipments', icon: <Wrench size={18} />, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Produits', href: '/administration/products', icon: <Warehouse size={18} />, roles: ['ADMIN', 'MANAGER'] },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen, userRole }: SidebarProps) => {
  const pathname = usePathname();
  const sidebar = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
          "fixed left-0 top-0 z-50 flex h-screen flex-col overflow-y-hidden bg-white shadow-lg duration-300 ease-in-out dark:bg-dark-surface",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          // Logique pour le bureau
          "lg:translate-x-0",
          isCollapsed ? "lg:w-20" : "lg:w-72"
        )}
      >
        <div className="flex h-20 items-center justify-between px-6 shrink-0 border-b border-gray-100 dark:border-dark-border">
          <Link href="/administration" className={cn(isCollapsed && "lg:hidden")}>
            <Image className="dark:hidden" width={120} height={35} src="/images/light-logo.png" alt="Logo" priority />
            <Image className="hidden dark:block" width={120} height={35} src="/images/dark-logo.png" alt="Logo" priority />
          </Link>
          <Link href="/administration" className={cn("hidden", isCollapsed && "lg:block")}>
             <Image className="dark:hidden" width={40} height={40} src="/images/light-mobile.PNG" alt="Icon" />
             <Image className="hidden dark:block" width={40} height={40} src="/images/dark-mobile.png" alt="Icon" />
          </Link>
          <button onClick={() => setIsCollapsed(!isCollapsed)} className={cn("hidden lg:block p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-border", isCollapsed && "rotate-180")}>
            <ChevronLeft size={16} />
          </button>
        </div>

        <div className="no-scrollbar flex flex-1 flex-col overflow-y-auto">
          <nav className="flex-1 mt-4 px-4 space-y-1">
            {menuItems.map((item, index) => {
              if (item.roles && userRole && !item.roles.includes(userRole)) return null;
              const isActive = pathname === item.href || (item.href !== '/administration' && pathname.startsWith(item.href));
              return (
                <Link
                  key={index}
                  href={item.href}
                  onClick={() => sidebarOpen && setSidebarOpen(false)}
                  title={isCollapsed ? item.name : ""}
                  className={cn(
                    "group flex items-center gap-3 rounded-md p-3 text-sm font-medium duration-200 ease-in-out",
                    isActive
                      ? "bg-primary-light text-primary dark:bg-dark-highlight-bg dark:text-white"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-highlight-bg",
                    isCollapsed && "lg:justify-center"
                  )}
                >
                  {item.icon}
                  <span className={cn("whitespace-nowrap", isCollapsed && "lg:hidden")}>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto p-4 space-y-2 border-t border-gray-100 dark:border-dark-border">
             <Link
                href="/administration/settings"
                className={cn(
                    "group flex items-center gap-3 rounded-md p-3 text-sm font-medium duration-200 ease-in-out",
                    pathname.startsWith('/administration/settings')
                      ? "bg-primary-light text-primary dark:bg-dark-highlight-bg dark:text-white"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-highlight-bg",
                    isCollapsed && "lg:justify-center"
                )}
             >
                <Settings size={18} />
                <span className={cn(isCollapsed && "lg:hidden")}>Réglages</span>
             </Link>
             <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className={cn(
                    "group flex w-full items-center gap-3 rounded-md p-3 text-sm font-medium duration-200 ease-in-out text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-highlight-bg",
                    isCollapsed && "lg:justify-center"
                )}
             >
                <LogOut size={18} />
                <span className={cn(isCollapsed && "lg:hidden")}>Déconnexion</span>
             </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;