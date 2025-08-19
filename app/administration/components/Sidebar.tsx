"use client";

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Package, 
  Briefcase,
  Receipt,
  DollarSign,
  BarChart3,
  Settings,
  MessageSquare,
  MapPin,
  Calendar,
  ClipboardList,
  X,
  Menu
} from 'lucide-react';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  userRole?: string | null;
}

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
  badge?: number;
}

const menuItems: MenuItem[] = [
  { 
    label: 'Tableau de bord', 
    href: '/administration', 
    icon: <LayoutDashboard className="h-4 w-4 md:h-5 md:w-5" /> 
  },
  { 
    label: 'Prospects', 
    href: '/administration/leads', 
    icon: <Users className="h-4 w-4 md:h-5 md:w-5" /> 
  },
  { 
    label: 'Clients', 
    href: '/administration/clients', 
    icon: <Users className="h-4 w-4 md:h-5 md:w-5" /> 
  },
  { 
    label: 'Devis', 
    href: '/administration/quotes', 
    icon: <FileText className="h-4 w-4 md:h-5 md:w-5" /> 
  },
  { 
    label: 'Factures', 
    href: '/administration/invoices', 
    icon: <Receipt className="h-4 w-4 md:h-5 md:w-5" /> 
  },
  { 
    label: 'Missions', 
    href: '/administration/missions', 
    icon: <Briefcase className="h-4 w-4 md:h-5 md:w-5" /> 
  },
  { 
    label: 'Bons de Livraison', 
    href: '/administration/delivery-notes', 
    icon: <ClipboardList className="h-4 w-4 md:h-5 md:w-5" /> 
  },
  { 
    label: 'Produits', 
    href: '/administration/products', 
    icon: <Package className="h-4 w-4 md:h-5 md:w-5" /> 
  },
  { 
    label: 'Équipements', 
    href: '/administration/equipment', 
    icon: <Settings className="h-4 w-4 md:h-5 md:w-5" /> 
  },
  { 
    label: 'Dépenses', 
    href: '/administration/expenses', 
    icon: <DollarSign className="h-4 w-4 md:h-5 md:w-5" />,
    roles: ['ADMIN', 'MANAGER']
  },
  { 
    label: 'Employés', 
    href: '/administration/employees', 
    icon: <Users className="h-4 w-4 md:h-5 md:w-5" />,
    roles: ['ADMIN', 'MANAGER']
  },
  { 
    label: 'Planning', 
    href: '/administration/planning', 
    icon: <Calendar className="h-4 w-4 md:h-5 md:w-5" /> 
  },
  { 
    label: 'Rapports', 
    href: '/administration/reports', 
    icon: <BarChart3 className="h-4 w-4 md:h-5 md:w-5" />,
    roles: ['ADMIN', 'MANAGER']
  },
  { 
    label: 'Support', 
    href: '/administration/support', 
    icon: <MessageSquare className="h-4 w-4 md:h-5 md:w-5" /> 
  },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen, userRole }: SidebarProps) {
  const pathname = usePathname();
  const trigger = useRef<HTMLButtonElement>(null);
  const sidebar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target as Node) || trigger.current.contains(target as Node)) return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  const filteredMenuItems = menuItems.filter(item => 
    !item.roles || item.roles.includes(userRole || '')
  );

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" aria-hidden="true">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div
        ref={sidebar}
        className={`fixed left-0 top-0 z-50 h-screen w-64 lg:w-72 bg-white dark:bg-boxdark border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-0`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 lg:px-6 py-4 lg:py-5 border-b border-gray-200 dark:border-gray-700">
          <Link href="/administration" className="flex items-center">
            <div className="flex items-center space-x-2 lg:space-x-3">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs lg:text-sm">E</span>
              </div>
              <span className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">Enarva</span>
            </div>
          </Link>
          
          <button
            ref={trigger}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 lg:mt-6 px-2 lg:px-3 h-full overflow-y-auto pb-20">
          <div className="space-y-1">
            {filteredMenuItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={index}
                  href={item.href}
                  className={`group flex items-center px-2 lg:px-3 py-2 lg:py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 border-r-4 border-blue-500 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className={`mr-2 lg:mr-3 flex-shrink-0 ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto inline-block py-0.5 px-2 text-xs bg-red-100 text-red-600 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
          </nav>

       {/* Footer */}
       <div className="absolute bottom-0 left-0 right-0 p-3 lg:p-4 border-t border-gray-200 dark:border-gray-700">
         <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
           Enarva SARL AU v2.0
         </div>
       </div>
     </div>
   </>
 );
}