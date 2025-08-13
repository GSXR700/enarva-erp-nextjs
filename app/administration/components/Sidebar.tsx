// app/administration/components/Sidebar.tsx

"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, FileText, Receipt, Settings, Briefcase, ChevronDown,
  Calendar, Warehouse, Users2, CreditCard, Download, Wallet, MapPin, Truck,
  ShoppingBag, Handshake, Car, Wrench, LucideIcon, Contact
} from "lucide-react";
import { Role } from "@prisma/client";
import { cn } from "@/lib/utils";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
  userRole?: Role;
}

const menuItems: {
    name: string;
    href?: string;
    icon: React.ReactElement<LucideIcon>;
    roles?: Role[];
    subItems?: { name: string; href: string; icon: React.ReactElement<LucideIcon>; }[];
}[] = [
    { name: 'Tableau de Bord', href: '/administration', icon: <LayoutDashboard size={20} /> },
    {
        name: 'Opérations', icon: <Briefcase size={20} />, roles: ['ADMIN', 'MANAGER'],
        subItems: [
            { name: 'Planning', href: '/administration/planning', icon: <Calendar size={16} /> },
            { name: 'Suivi Temps Réel', href: '/administration/tracking', icon: <MapPin size={16} /> },
            { name: 'Missions', href: '/administration/missions', icon: <Briefcase size={16} /> },
        ]
    },
    {
        name: 'Ventes & CRM', icon: <Handshake size={20} />, roles: ['ADMIN', 'MANAGER'],
        subItems: [
            { name: 'Leads (Prospects)', href: '/administration/leads', icon: <Contact size={16} /> },
            { name: 'Clients', href: '/administration/clients', icon: <Users size={16} /> },
            { name: 'Devis', href: '/administration/quotes', icon: <FileText size={16} /> },
        ]
    },
    {
        name: 'Finance & Achats', icon: <CreditCard size={20} />, roles: ['ADMIN', 'MANAGER', 'FINANCE'],
        subItems: [
            { name: 'Factures', href: '/administration/invoices', icon: <Receipt size={16} /> },
            { name: 'Dépenses', href: '/administration/expenses', icon: <Wallet size={16} /> },
            { name: 'Fournisseurs', href: '/administration/suppliers', icon: <ShoppingBag size={16} /> },
            { name: 'Reporting', href: '/administration/reporting', icon: <Download size={16} /> },
        ]
    },
    {
        name: 'Ressources Humaines', icon: <Users2 size={20} />, roles: ['ADMIN', 'MANAGER'],
        subItems: [
            { name: 'Employés', href: '/administration/employees', icon: <Users2 size={16} /> },
            { name: 'Paie & RH', href: '/administration/payroll', icon: <CreditCard size={16} /> },
        ]
    },
    {
        name: 'Logistique & Stock', icon: <Car size={20} />, roles: ['ADMIN', 'MANAGER'],
        subItems: [
            { name: 'Équipements', href: '/administration/equipments', icon: <Wrench size={16} /> },
            { name: 'Produits & Services', href: '/administration/products', icon: <Warehouse size={16} /> },
            { name: 'Sous-traitants', href: '/administration/subcontractors', icon: <Handshake size={16} /> },
            { name: 'Bons de Livraison', href: '/administration/delivery-notes', icon: <Truck size={16} /> },
        ]
    },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen, userRole }: SidebarProps) => {
  const pathname = usePathname();
  const sidebar = useRef<HTMLDivElement>(null);

  const [isCollapsed, setIsCollapsed] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !sidebarOpen || sidebar.current.contains(target as Node)) return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, [sidebarOpen, setSidebarOpen]);

  useEffect(() => {
    const activeItem = menuItems.find(item =>
      item.subItems?.some(sub => pathname.startsWith(sub.href))
    );
    setOpenDropdown(activeItem ? activeItem.name : null);
  }, [pathname]);

  useEffect(() => {
    if (isCollapsed) {
        setOpenDropdown(null);
    }
  }, [isCollapsed]);

  const handleDropdownToggle = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <>
        <div className={cn(
            "fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity duration-200 lg:hidden",
            sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )} onClick={() => setSidebarOpen(false)}></div>

        <aside
            ref={sidebar}
            onMouseEnter={() => window.innerWidth > 1024 && setIsCollapsed(false)}
            onMouseLeave={() => window.innerWidth > 1024 && setIsCollapsed(true)}
            className={cn(
                "fixed left-0 top-0 z-50 flex h-screen flex-col overflow-y-hidden bg-white shadow-lg duration-300 ease-in-out dark:bg-dark-surface",
                "lg:static lg:translate-x-0",
                sidebarOpen ? "translate-x-0" : "-translate-x-full",
                isCollapsed ? "lg:w-20" : "lg:w-72"
            )}
        >
            <div className="flex h-20 items-center justify-center px-6 shrink-0">
                <Link href="/administration">
                    <div className={cn(isCollapsed ? "lg:hidden" : "block")}>
                        <Image className="dark:hidden" width={120} height={35} src="/images/light-logo.png" alt="Logo" priority />
                        <Image className="hidden dark:block" width={120} height={35} src="/images/dark-logo.png" alt="Logo" priority />
                    </div>
                    <div className={cn("hidden", isCollapsed && "lg:block")}>
                        <Image className="dark:hidden" width={40} height={40} src="/images/light-mobile.png" alt="Icon" />
                        <Image className="hidden dark:block" width={40} height={40} src="/images/dark-mobile.png" alt="Icon" />
                    </div>
                </Link>
            </div>

            <div className="no-scrollbar flex flex-1 flex-col overflow-y-auto">
                <nav className="flex-1 mt-5 py-4 px-4 space-y-2">
                    {menuItems.map((item) => {
                        if (item.roles && userRole && !item.roles.includes(userRole)) {
                            return null;
                        }

                        const isDropdownOpen = openDropdown === item.name;
                        const isActive = item.href ? pathname === item.href : item.subItems?.some(sub => pathname.startsWith(sub.href));

                        if (item.subItems) {
                            return (
                                <div key={item.name}>
                                    <button
                                        onClick={() => handleDropdownToggle(item.name)}
                                        className={cn(
                                            "group flex w-full items-center justify-between rounded-md p-3 font-medium duration-200 ease-in-out",
                                            isActive ? "bg-primary-light text-primary dark:bg-dark-highlight-bg dark:text-white" : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            {item.icon}
                                            <span className={cn("whitespace-nowrap duration-200", isCollapsed && "lg:hidden")}>{item.name}</span>
                                        </div>
                                        <ChevronDown size={16} className={cn("transform transition-transform duration-200", isDropdownOpen && "rotate-180", isCollapsed && "lg:hidden")} />
                                    </button>
                                    <div className={cn("overflow-hidden transition-all duration-300 ease-in-out", isCollapsed ? "max-h-0" : (isDropdownOpen ? "max-h-60" : "max-h-0"))}>
                                        <ul className={cn("mt-2 flex-col gap-1 pl-8", isCollapsed ? "hidden" : "flex")}>
                                            {item.subItems.map(subItem => (
                                                <li key={subItem.name}>
                                                    <Link href={subItem.href} className={cn("group relative flex items-center gap-3 rounded-md p-2 text-sm duration-200", pathname.startsWith(subItem.href) ? "text-primary dark:text-white" : "text-gray-500 hover:text-primary dark:text-dark-subtle dark:hover:text-white")}>
                                                        {subItem.icon}
                                                        <span>{subItem.name}</span>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={item.name}>
                                <Link href={item.href || '#'}
                                    className={cn("group flex items-center gap-3 rounded-md p-3 font-medium duration-200 ease-in-out",
                                        isCollapsed && "lg:justify-center",
                                        (pathname.startsWith(item.href || '#') && item.href !== '/administration') || pathname === item.href ? "bg-primary-light text-primary dark:bg-dark-highlight-bg dark:text-white" : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    )}
                                >
                                    {item.icon}
                                    <span className={cn("whitespace-nowrap duration-200", isCollapsed && "lg:hidden")}>{item.name}</span>
                                </Link>
                            </div>
                        );
                    })}
                </nav>
                <div className="mt-auto px-4 pb-4">
                    <Link
                        href="/administration/settings"
                        className={cn("group flex items-center gap-3 rounded-md p-3 font-medium duration-200 ease-in-out text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
                            isCollapsed && "lg:justify-center",
                            pathname.startsWith('/administration/settings') ? 'bg-gray-100 dark:bg-gray-700' : ''
                        )}
                    >
                        <Settings size={20} />
                        <span className={cn("whitespace-nowrap duration-200", isCollapsed && "lg:hidden")}>Réglages</span>
                    </Link>
                </div>
            </div>
        </aside>
    </>
  );
};

export default Sidebar;