// app/administration/components/Sidebar.tsx
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
  ChevronLeft,
  ChevronRight,
  X
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
    icon: <LayoutDashboard size={20} /> 
  },
  { 
    label: 'Clients', 
    href: '/administration/clients', 
    icon: <Users size={20} /> 
  },
  { 
    label: 'Devis', 
    href: '/administration/quotes', 
    icon: <FileText size={20} /> 
  },
  { 
    label: 'Factures', 
    href: '/administration/invoices', 
    icon: <Receipt size={20} /> 
  },
  { 
    label: 'Missions', 
    href: '/administration/missions', 
    icon: <Briefcase size={20} /> 
  },
  { 
    label: 'Bons de Livraison', 
    href: '/administration/delivery-notes', 
    icon: <ClipboardList size={20} /> 
  },
  { 
    label: 'Inventaire', 
    href: '/administration/inventory', 
    icon: <Package size={20} /> 
  },
  { 
    label: 'Dépenses', 
    href: '/administration/expenses', 
    icon: <DollarSign size={20} />,
    roles: ['ADMIN', 'MANAGER']
  },
  { 
    label: 'Employés', 
    href: '/administration/employees', 
    icon: <Users size={20} />,
    roles: ['ADMIN', 'MANAGER']
  },
  { 
    label: 'Planning', 
    href: '/administration/planning', 
    icon: <Calendar size={20} /> 
  },
  { 
    label: 'Messagerie', 
    href: '/administration/chat', 
    icon: <MessageSquare size={20} />,
    badge: 0 // Sera mis à jour dynamiquement
  },
  { 
    label: 'Carte', 
    href: '/administration/map', 
    icon: <MapPin size={20} /> 
  },
  { 
    label: 'Rapports', 
    href: '/administration/reports', 
    icon: <BarChart3 size={20} />,
    roles: ['ADMIN', 'MANAGER']
  },
  { 
    label: 'Paramètres', 
    href: '/administration/settings', 
    icon: <Settings size={20} /> 
  },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen, userRole }: SidebarProps) {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Filtrer les éléments du menu selon le rôle
  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(userRole || '');
  });

  // Fermer la sidebar en cliquant à l'extérieur (mobile)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        window.innerWidth < 1024
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen, setSidebarOpen]);

  // Récupérer le nombre de messages non lus
  useEffect(() => {
    fetch('/api/chat/unread-count')
      .then(res => res.json())
      .then(data => setUnreadMessages(data.count || 0))
      .catch(() => {});
  }, [pathname]);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Overlay pour mobile et desktop quand sidebar est ouverte */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`
          fixed left-0 top-0 z-50 h-screen bg-dark-container shadow-xl
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'w-20' : 'w-72'}
          lg:relative lg:translate-x-0
        `}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-dark-border">
            {!isCollapsed && (
              <Link href="/administration" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">E</span>
                </div>
                <span className="text-xl font-bold text-white">Enarva</span>
              </Link>
            )}
            
            {/* Boutons de contrôle */}
            <div className="flex items-center gap-2">
              {/* Bouton collapse (desktop) */}
              <button
                onClick={handleToggleCollapse}
                className="hidden lg:flex items-center justify-center p-2 rounded-lg hover:bg-dark-surface transition-colors"
              >
                {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
              
              {/* Bouton fermer (mobile) */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-dark-surface transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {filteredMenuItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/administration' && pathname.startsWith(item.href));
                
                // Mettre à jour le badge pour la messagerie
                if (item.label === 'Messagerie') {
                  item.badge = unreadMessages;
                }
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg
                        transition-all duration-200
                        ${isActive 
                          ? 'bg-primary text-white shadow-lg' 
                          : 'text-gray-300 hover:bg-dark-surface hover:text-white'
                        }
                        ${isCollapsed ? 'justify-center' : ''}
                      `}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      {!isCollapsed && (
                        <>
                          <span className="flex-1">{item.label}</span>
                          {item.badge !== undefined && item.badge > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                              {item.badge > 99 ? '99+' : item.badge}
                            </span>
                          )}
                        </>
                      )}
                      {isCollapsed && item.badge !== undefined && item.badge > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer avec informations utilisateur */}
          {!isCollapsed && (
            <div className="border-t border-dark-border p-4">
              <div className="text-xs text-gray-400">
                <p>© 2025 Enarva SARL</p>
                <p className="mt-1">Version 2.0.1</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}