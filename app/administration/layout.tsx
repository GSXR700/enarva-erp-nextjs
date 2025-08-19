// app/administration/layout.tsx
"use client";

import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { ProgressBar } from "./components/ProgressBar";
import { useSession } from "next-auth/react";
import { InitialLoader } from "./components/skeletons/InitialLoader";
import { NotificationsProvider } from "@/app/context/NotificationContext";
import { ModalProvider } from "@/providers/modal-provider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session, status } = useSession();
  const [isMobile, setIsMobile] = useState(false);

  // Détecter si on est sur mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (status === "loading") {
    return <InitialLoader />;
  }

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark min-h-screen">
      <ProgressBar />
      <NotificationsProvider>
        <ModalProvider />
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar avec overlay mode sur desktop et mobile */}
          <Sidebar 
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen} 
            userRole={session?.user?.role} 
          />
          
          {/* Contenu principal */}
          <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            <Header 
              sidebarOpen={sidebarOpen} 
              setSidebarOpen={setSidebarOpen} 
            />
            <main className="flex-1">
              <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                {children}
              </div>
            </main>
          </div>
        </div>
      </NotificationsProvider>
    </div>
  );
}