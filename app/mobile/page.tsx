// app/mobile/page.tsx
import { MobileView } from "./components/MobileView";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { notFound } from "next/navigation";

// La fonction récupère maintenant l'employé basé sur la session
async function getEmployeeForCurrentUser() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return null;
    }

    const employee = await prisma.employee.findUnique({
      where: {
        userId: session.user.id,
      },
    });
    return employee;
}

export default async function MobileAppPage() {
    const employee = await getEmployeeForCurrentUser();

    // Si aucun employé n'est lié à cet utilisateur, on affiche l'erreur
    if (!employee) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="p-8 text-center bg-white rounded-lg shadow-md">
                    <h1 className="text-xl font-bold text-red-600">Erreur de Configuration</h1>
                    <p className="mt-2 text-gray-600">
                        Aucun profil employé n'est lié à votre compte utilisateur.
                    </p>
                </div>
            </div>
        );
    }

    return <MobileView employee={employee} />;
}