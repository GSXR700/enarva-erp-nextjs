// app/administration/components/dashboard/WelcomeBanner.tsx
"use client";
import { useSession } from "next-auth/react";
import Image from "next/image"; // Import the Image component

export function WelcomeBanner() {
    const { data: session } = useSession();
    const userName = session?.user?.name?.split(' ')[0] || 'Utilisateur';

    return (
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-2xl shadow-lg flex justify-between items-center">
            {/* Text content */}
            <div className="relative z-10">
                <h2 className="text-2xl font-bold">Bienvenue, {userName} !</h2>
                <p className="mt-1 text-blue-200">Voici un aperçu de votre activité aujourd'hui.</p>
            </div>

            {/* Background Logo */}
            <div className="absolute right-0 bottom-0 z-0">
                <Image
                  src="/images/dark-mobile.png"
                  alt="Enarva Logo"
                  width={100}
                  height={100}
                  className="opacity-50"
                  style={{ transform: 'translate(20%, 20%)' }} // Adjust position to be slightly off-card
                />
            </div>
        </div>
    );
}