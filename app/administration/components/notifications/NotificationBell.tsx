// enarva-nextjs-dashboard-app/app/administration/components/notifications/NotificationBell.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from 'next/link';
import { useNotifications } from '@/app/context/NotificationContext';
import type { Notification } from '@/app/context/NotificationContext';
import { Bell } from 'lucide-react';
import { UserAvatar } from '../UserAvatar';

const NotificationSkeleton = () => (
    <div className="p-3 animate-pulse">
        <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-dark-surface flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-dark-surface rounded-full w-full"></div>
                <div className="h-3 bg-gray-200 dark:bg-dark-surface rounded-full w-1/3"></div>
            </div>
        </div>
    </div>
);

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!dropdownRef.current || !isOpen) return;
      if (dropdownRef.current.contains(target as Node)) return;
      setIsOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });
  
  const handleNotificationClick = (id: string) => {
    markAsRead(id);
    setIsOpen(false);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-100 hover:bg-gray-200 dark:border-dark-border dark:bg-dark-surface dark:hover:bg-dark-border">
        <Bell size={20} className="text-gray-600 dark:text-dark-subtle" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        // La largeur a été augmentée à w-96 (384px)
        <div className="absolute right-0 mt-2 w-96 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-dark-container dark:ring-dark-border">
          <div className="p-3 font-semibold border-b dark:border-dark-border dark:text-white">Notifications</div>
          <ul className="divide-y divide-gray-100 dark:divide-dark-border max-h-96 overflow-y-auto">
            {isLoading ? (
                <><NotificationSkeleton /><NotificationSkeleton /></>
            ) : notifications.length > 0 ? (
              notifications.map(notif => (
                <li key={notif.id} className={`${!notif.read ? 'bg-blue-50 dark:bg-primary/10' : 'bg-transparent'}`}>
                  <Link href={notif.link || '#'} onClick={() => handleNotificationClick(notif.id)} className="block p-3 hover:bg-gray-100 dark:hover:bg-dark-surface">
                     <div className="flex items-center gap-3">
                        {/* Utilisation du composant UserAvatar avec les données de l'expéditeur */}
                        <UserAvatar                          src={notif.sender?.image ?? undefined}
                          name={notif.sender?.name ?? undefined}
                          size={40} 
                        />
                        <div className="flex-1">
                            <p className="text-sm text-gray-700 dark:text-dark-text" dangerouslySetInnerHTML={{ __html: notif.message }}></p>
                            <p className="text-xs text-gray-400 dark:text-dark-subtle mt-1">{new Date(notif.createdAt).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</p>
                        </div>
                    </div>
                  </Link>
                </li>
              ))
            ) : (
                <p className="p-4 text-center text-sm text-gray-500 dark:text-dark-subtle">Aucune nouvelle notification</p>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}