"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Menu, MessageSquare, Map } from "lucide-react";
import { UserMenu } from "./UserMenu";
import { GlobalSearch } from "./search/GlobalSearch";
import { NotificationBell } from "./notifications/NotificationBell";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Header = ({ sidebarOpen, setSidebarOpen }: HeaderProps) => {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-30 flex w-full bg-white drop-shadow-sm dark:bg-dark-surface dark:drop-shadow-none">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-sm md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Bouton pour ouvrir/fermer la sidebar sur mobile */}
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(!sidebarOpen);
            }}
            className="z-50 block rounded-sm border border-gray-200 bg-white p-1.5 shadow-sm dark:border-dark-border dark:bg-dark-container lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          {/* Section de recherche */}
          <div className="hidden lg:block">
            <GlobalSearch />
          </div>
        </div>

        {/* Section utilisateur à droite */}
        <div className="flex items-center gap-4 2xl:gap-7">
          <div className="flex items-center gap-3">
            <Link 
              href="/administration/chat" 
              className="text-gray-600 hover:text-primary dark:text-dark-subtle dark:hover:text-primary"
              title="Chat"
            >
              <MessageSquare size={22} />
            </Link>
            <Link 
              href="/administration/tracking" 
              className="text-gray-600 hover:text-primary dark:text-dark-subtle dark:hover:text-primary"
              title="Suivi"
            >
              <Map size={22} />
            </Link>
          </div>

          <NotificationBell />
          
          {/* CORRECTION ICI : On n'a plus besoin de passer la session */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
};