// app/administration/components/Header.tsx
"use client";

import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { UserMenu } from "./UserMenu";
import { GlobalSearch } from "./search/GlobalSearch";
import { NotificationBell } from "./notifications/NotificationBell";
import { Menu, MessageSquare } from "lucide-react";
import { UserAvatar } from "./UserAvatar";

const Header = (props: {
  sidebarOpen: boolean;
  setSidebarOpen: (arg0: boolean) => void;
}) => {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!dropdownRef.current || !dropdownOpen) return;
      if (dropdownRef.current.contains(target as Node)) return;
      setDropdownOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  return (
    <header className="sticky top-0 z-30 flex w-full bg-white drop-shadow-sm dark:bg-dark-surface dark:drop-shadow-none">
      <div className="flex flex-grow items-center justify-between py-4 px-4 shadow-sm md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
            {/* NOUVEAU: Bouton pour ouvrir/fermer la sidebar sur mobile */}
            <button
                aria-controls="sidebar"
                onClick={(e) => {
                    e.stopPropagation();
                    props.setSidebarOpen(!props.sidebarOpen);
                }}
                className="p-1.5 rounded-sm border border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:border-dark-border dark:bg-dark-highlight-bg dark:text-white lg:hidden"
            >
                <Menu className="h-6 w-6" />
            </button>
        </div>
        
        {/* Section de recherche (existante) */}
        <div className="hidden lg:block">
            <GlobalSearch />
        </div>

        {/* Section utilisateur à droite (existante) */}
        <div className="flex items-center gap-3 2xsm:gap-7">
            <div className="flex items-center gap-3">
                <Link href="/administration/chat" className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-100 hover:bg-gray-200 dark:border-dark-border dark:bg-dark-surface dark:hover:bg-dark-border">
                    <MessageSquare size={20} className="text-gray-600 dark:text-dark-subtle" />
                </Link>
                <NotificationBell />
            </div>
            <div className="h-10 w-px bg-gray-200 dark:bg-dark-border"></div>
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-4">
                <span className="hidden text-right lg:block">
                  <span className="block text-sm font-medium text-black dark:text-dark-text">
                    {session?.user?.name}
                  </span>
                  <span className="block text-xs text-gray-500 dark:text-dark-subtle">{session?.user?.email}</span>
                </span>
                <UserAvatar src={session?.user?.image} name={session?.user?.name} size={40} />
              </button>
              {dropdownOpen && <UserMenu />}
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;