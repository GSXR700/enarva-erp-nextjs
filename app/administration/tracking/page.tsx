// enarva-nextjs-app/app/administration/tracking/page.tsx
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
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">
          Suivi des Équipes en Temps Réel
        </h1>
      </div>

      <div className="bg-white dark:bg-dark-container rounded-lg shadow-md h-[70vh] w-full">
        <LiveMap initialEmployees={initialEmployees} />
      </div>
    </div>
  );
}