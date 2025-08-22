// app/administration/tracking/page.tsx
import { LiveMap } from "./components/LiveMap";
import { headers } from "next/headers";

async function getTrackedEmployees() {
    const host = headers().get('host');
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const url = `${protocol}://${host}/api/tracking/employees`;
    
    try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) {
            console.error(`Failed to fetch tracked employees. Status: ${res.status}`);
            return [];
        }
        return res.json();
    } catch (error) {
        console.error("Error fetching tracked employees:", error);
        return [];
    }
}

export default async function TrackingPage() {
  const initialEmployees = await getTrackedEmployees();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header responsive */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                Suivi des Équipes
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 hidden sm:block">
                {initialEmployees.length} employé{initialEmployees.length > 1 ? 's' : ''} en suivi temps réel
              </p>
            </div>
            
            {/* Actions header - visible uniquement sur desktop */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Mise à jour automatique</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-hidden">
          <div className="h-[calc(100vh-200px)] sm:h-[calc(100vh-180px)] lg:h-[70vh] w-full">
            <LiveMap initialEmployees={initialEmployees} />
          </div>
        </div>

        {/* Informations additionnelles pour mobile */}
        <div className="mt-4 lg:hidden">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Mise à jour automatique</span>
              </div>
              <span className="text-gray-500 dark:text-gray-400">
                {initialEmployees.length} employé{initialEmployees.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}