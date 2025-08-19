"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import { UserAvatar } from "./UserAvatar";

export const UserMenu = () => {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Gère la fermeture du menu en cliquant à l'extérieur
  useEffect(() => {
    const clickHandler = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", clickHandler);
    return () => document.removeEventListener("mousedown", clickHandler);
  }, []);

  if (!session) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-4"
      >
        <span className="hidden text-right lg:block">
          <span className="block text-sm font-medium text-black dark:text-dark-text">
            {session.user?.name}
          </span>
          <span className="block text-xs text-gray-500 dark:text-dark-subtle">
            {session.user?.role}
          </span>
        </span>
        <UserAvatar src={session.user?.image} name={session.user?.name} size={40} />
        <ChevronDown className="hidden h-4 w-4 text-gray-500 lg:block" />
      </button>

      {/* Menu déroulant */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-dark-surface rounded-lg shadow-lg border border-gray-200 dark:border-dark-border z-50">
          <div className="p-4 border-b border-gray-200 dark:border-dark-border">
            <p className="font-semibold text-gray-800 dark:text-white">{session.user?.name}</p>
            <p className="text-sm text-gray-500 dark:text-dark-subtle truncate">{session.user?.email}</p>
          </div>
          <div className="py-2">
            <Link
              href="/administration/settings"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-dark-subtle hover:bg-gray-100 dark:hover:bg-dark-highlight-bg"
            >
              <Settings className="mr-3 h-4 w-4" />
              <span>Réglages</span>
            </Link>
          </div>
          <div className="border-t border-gray-200 dark:border-dark-border py-2">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-dark-highlight-bg"
            >
              <LogOut className="mr-3 h-4 w-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};