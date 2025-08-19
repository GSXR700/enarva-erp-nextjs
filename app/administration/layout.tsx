"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import { Header } from "./components/Header";
import { ProgressBar } from "./components/ProgressBar";
import { useSession } from "next-auth/react";
import { InitialLoader } from "./components/skeletons/InitialLoader";
import { ModalProvider } from "@/providers/modal-provider";
import { NotificationsProvider } from "@/app/context/NotificationContext"; // <-- 1. Importer le fournisseur

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <InitialLoader />;
  }

  return (
    // 2. Envelopper tout le contenu avec le fournisseur de notifications
    <NotificationsProvider>
      <div className="dark:bg-dark-background dark:text-gray-100">
        <ProgressBar />
        <div className="flex h-screen overflow-hidden">
          <Sidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            userRole={session?.user?.role}
          />
          <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <main>
              <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                <ModalProvider />
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </NotificationsProvider>
  );
}