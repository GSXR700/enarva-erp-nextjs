// app/administration/layout.tsx
"use client";

import { useState } from "react";
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

  if (status === "loading") {
    return <InitialLoader />;
  }

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark">
      <ProgressBar />
      <NotificationsProvider>
        <ModalProvider />
        <div className="flex h-screen overflow-hidden">
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} userRole={session?.user?.role} />
          <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <main>
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