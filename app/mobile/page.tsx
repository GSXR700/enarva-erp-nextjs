// app/mobile/page.tsx
import { MobileView } from "./components/MobileView";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

async function getEmployeeForCurrentUser() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            console.log("❌ Mobile Page: No session found");
            return null;
        }

        console.log(`🔍 Mobile Page: Finding employee for user ${session.user.id}`);

        const employee = await prisma.employee.findUnique({
            where: {
                userId: session.user.id,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                },
                defaultPayRate: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        amount: true
                    }
                }
            }
        });

        if (employee) {
            console.log(`✅ Mobile Page: Found employee ${employee.id} for user ${session.user.id}`);
        } else {
            console.log(`❌ Mobile Page: No employee found for user ${session.user.id}`);
        }

        return employee;
        
    } catch (error) {
        console.error("❌ Mobile Page: Error fetching employee:", error);
        return null;
    }
}

export default async function MobileAppPage() {
    console.log("🚀 Mobile Page: Loading mobile app");
    
    const session = await getServerSession(authOptions);
    
    // Redirect if not authenticated
    if (!session) {
        console.log("❌ Mobile Page: No session, redirecting to signin");
        redirect("/api/auth/signin");
    }

    const employee = await getEmployeeForCurrentUser();

    // Si aucun employé n'est lié à cet utilisateur, on affiche l'erreur
    if (!employee) {
        console.log("❌ Mobile Page: No employee profile found");
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100 p-4">
                <div className="p-8 text-center bg-white rounded-lg shadow-md max-w-md w-full">
                    <div className="mb-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-xl font-bold text-red-600 mb-4">
                        Erreur de Configuration
                    </h1>
                    <p className="text-gray-600 mb-4">
                        Aucun profil employé n'est lié à votre compte utilisateur.
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                        Contactez votre administrateur pour résoudre ce problème.
                    </p>
                    <div className="space-y-3 text-left bg-gray-50 p-4 rounded-lg">
                        <div>
                            <p className="text-xs text-gray-500">Utilisateur connecté:</p>
                            <p className="text-sm font-mono bg-white p-2 rounded border">
                                {session.user?.email || session.user?.name || "Inconnu"}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">ID Utilisateur:</p>
                            <p className="text-xs font-mono bg-white p-2 rounded border break-all">
                                {session.user?.id || "Non disponible"}
                            </p>
                        </div>
                    </div>
                    <div className="mt-6">
                        <a 
                            href="/api/auth/signout"
                            className="inline-block px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
                        >
                            Se déconnecter
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    // Check if user should have access to mobile interface
    if (!employee.user || !['FIELD_WORKER', 'USER', 'ADMIN', 'MANAGER'].includes(employee.user.role)) {
        console.log(`❌ Mobile Page: Invalid role ${employee.user?.role} for mobile access`);
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100 p-4">
                <div className="p-8 text-center bg-white rounded-lg shadow-md max-w-md w-full">
                    <div className="mb-4">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-xl font-bold text-orange-600 mb-4">
                        Accès Restreint
                    </h1>
                    <p className="text-gray-600 mb-4">
                        Cette interface est principalement réservée aux agents de terrain.
                    </p>
                    <div className="bg-orange-50 p-4 rounded-lg mb-6">
                        <p className="text-sm text-gray-600">
                            Votre rôle actuel: <span className="font-semibold">{employee.user.role}</span>
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                            Employé: <span className="font-semibold">{employee.firstName} {employee.lastName}</span>
                        </p>
                    </div>
                    <div className="space-x-4">
                        <a 
                            href="/administration"
                            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                        >
                            Administration
                        </a>
                        <a 
                            href="/api/auth/signout"
                            className="inline-block px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
                        >
                            Se déconnecter
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    console.log(`✅ Mobile Page: Loading mobile view for employee ${employee.id}`);
    return <MobileView employee={employee} />;
}
