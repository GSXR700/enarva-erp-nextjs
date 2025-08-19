"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import { Header } from "./components/Header";
import { ProgressBar } from "./components/ProgressBar";
import { useSession } from "next-auth/react";
import { InitialLoader } from "./components/skeletons/InitialLoader";
import { ModalProvider } from "@/providers/modal-provider";
import { cn } from "@/lib/utils";

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
    <div className="dark:bg-dark-background dark:text-gray-100">
      <ProgressBar />
      <div className="flex h-screen overflow-hidden">
        {/* La Sidebar est maintenant en position fixe/absolue et ne pousse plus le contenu */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          userRole={session?.user?.role}
        />
        {/* Le contenu principal a une marge à gauche pour laisser de la place à la sidebar réduite */}
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden lg:ml-20">
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
  );
}