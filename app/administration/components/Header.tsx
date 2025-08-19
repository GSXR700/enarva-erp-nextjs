"use client";

import { useState, useRef, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { 
  Menu, 
  Bell, 
  MessageSquare, 
  Search, 
  Sun, 
  Moon, 
  LogOut, 
  User, 
  Settings,
  ChevronDown,
  Plus
} from "lucide-react";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Quick actions for mobile
  const quickActions = [
    { icon: <Plus className="h-4 w-4" />, label: "Nouveau", href: "/administration/leads/new" },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-boxdark border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between h-14 md:h-16 px-4 lg:px-6">
        
        {/* Left: Mobile menu button + Search */}
        <div className="flex items-center space-x-3 lg:space-x-4 flex-1">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Search - hidden on small mobile */}
          <div className="hidden sm:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-background dark:border-dark-border dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Right: Actions + User menu */}
        <div className="flex items-center space-x-2 lg:space-x-3">
          
          {/* Quick actions - mobile only */}
          <div className="sm:hidden flex items-center space-x-1">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={action.label}
              >
                {action.icon}
              </Link>
            ))}
          </div>

          {/* Search icon - mobile only */}
          <button className="sm:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <Search className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Messages */}
          <Link
            href="/administration/messages"
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <MessageSquare className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
              2
            </span>
          </Link>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* Notifications dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-boxdark rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Nouvelle mission assignée</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Il y a 5 minutes</p>
                  </div>
                  <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Devis accepté par TLS Groupe</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Il y a 1 heure</p>
                  </div>
                  <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Facture en retard</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Il y a 2 heures</p>
                  </div>
                </div>
                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <Link 
                    href="/administration/notifications"
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    Voir toutes les notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Theme toggle - desktop only */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>

          {/* User menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 lg:space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="h-7 w-7 lg:h-8 lg:w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <User className="h-4 w-4 lg:h-5 lg:w-5 text-gray-600 dark:text-gray-300" />
                )}
              </div>
              <span className="hidden lg:block text-sm font-medium text-gray-900 dark:text-white truncate max-w-24">
                {session?.user?.name?.split(' ')[0] || 'Utilisateur'}
              </span>
              <ChevronDown className="hidden lg:block h-4 w-4 text-gray-400" />
            </button>

            {/* User dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-boxdark rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {session?.user?.name || 'Utilisateur'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {session?.user?.email}
                  </p>
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-1">
                    {session?.user?.role}
                  </p>
                </div>
                
                <div className="py-2">
                  <Link
                    href="/administration/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <User className="mr-3 h-4 w-4" />
                    Mon profil
                  </Link>
                  <Link
                    href="/administration/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Settings className="mr-3 h-4 w-4" />
                    Paramètres
                  </Link>
                  
                  {/* Mobile theme toggle */}
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="lg:hidden flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {isDarkMode ? (
                      <>
                        <Sun className="mr-3 h-4 w-4" />
                        Mode clair
                      </>
                    ) : (
                      <>
                        <Moon className="mr-3 h-4 w-4" />
                        Mode sombre
                      </>
                    )}
                  </button>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 py-2">
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}