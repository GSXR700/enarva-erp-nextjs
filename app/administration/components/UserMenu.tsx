// app/administration/components/UserMenu.tsx
"use client";

import { SignOutButton } from "@/app/components/auth/SignOutButton";
import { User, Settings, LogOut } from "lucide-react";
import Link from "next/link";

export function UserMenu() {
  return (
    <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-dark-surface dark:ring-dark-border">
      <div className="py-1">
        <div className="px-4 py-2">
            <p className="text-sm text-gray-700 dark:text-dark-text">Connecté en tant que</p>
            <p className="text-sm font-medium text-gray-900 truncate dark:text-white">webmaster@enarva.com</p>
        </div>
        <div className="border-t border-gray-100 dark:border-dark-border"></div>
        <Link href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-dark-subtle dark:hover:bg-gray-700">
            <User size={16} />
            <span>Mon Profil</span>
        </Link>
        <Link href="/administration/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-dark-subtle dark:hover:bg-gray-700">
            <Settings size={16} />
            <span>Réglages</span>
        </Link>
        <div className="border-t border-gray-100 dark:border-dark-border"></div>
        <div className="px-4 py-2">
            <SignOutButton />
        </div>
      </div>
    </div>
  );
}