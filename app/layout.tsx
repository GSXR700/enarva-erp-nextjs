// app/layout.tsx
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../components/AuthProvider";
import { EdgeStoreProvider } from "../lib/edgestore"; // <-- IMPORTER
import { Toaster } from "sonner";

// Configurer la police Poppins avec les épaisseurs nécessaires
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Administration - Enarva Workspace",
  description: "Panneau de gestion pour Enarva SARL AU",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Ce script évite le flash de couleur au chargement de la page */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const colorMode = window.localStorage.getItem('color-mode') || 'system';
                if (colorMode === 'dark' || (colorMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      {/* Appliquer la classe de la police Poppins et les couleurs de fond */}
      <body className={`${poppins.className} bg-gray-100 dark:bg-[#1b1c1d]`}>
        <AuthProvider>
          {/* CORRECTION : Envelopper les enfants avec le EdgeStoreProvider */}
          <EdgeStoreProvider>
            {children}
          </EdgeStoreProvider>
        </AuthProvider>
         <Toaster position="top-center" richColors /> {/* <-- 2. Ajouter le composant ici */}
      </body>
    </html>
  );
}