// app/administration/tracking/page.tsx
// 🔧 AJOUT: Debug pour voir les données
import { LiveMap } from "./components/LiveMap";
import { headers } from "next/headers";

async function getTrackedEmployees() {
    const host = headers().get('host');
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const url = `${protocol}://${host}/api/tracking/employees`;
    
    try {
        console.log('🔍 Fetching employees from:', url);
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) {
            console.error(`❌ Failed to fetch tracked employees. Status: ${res.status}`);
            return [];
        }
        const data = await res.json();
        console.log('📊 Employees data received:', data);
        console.log('📍 Employees with location:', data.filter((emp: any) => emp.currentLatitude && emp.currentLongitude));
        return data;
    } catch (error) {
        console.error("❌ Error fetching tracked employees:", error);
        return [];
    }
}

export default async function TrackingPage() {
  const initialEmployees = await getTrackedEmployees();
  
  // 🔧 AJOUT: Log pour debug
  console.log('🗺️ Initial employees for map:', initialEmployees);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">
          Suivi des Équipes en Temps Réel
        </h1>
        {/* 🔧 AJOUT: Compteur pour debug */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {initialEmployees.length} employé(s) chargé(s)
        </div>
      </div>

      <div className="relative w-full">
        <div className="bg-white dark:bg-dark-container rounded-lg shadow-md overflow-hidden">
          <div className="h-[calc(100vh-12rem)] min-h-[500px] w-full">
            <LiveMap initialEmployees={initialEmployees} />
          </div>
        </div>
      </div>
    </div>
  );
}