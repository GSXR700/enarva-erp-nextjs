// enarva-nextjs-dashboard-app/app/administration/components/charts/MissionStatusChart.tsx
"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface MissionStatusData {
  name: string;
  value: number;
}

// 1. Définir les couleurs ET les traductions pour chaque statut
const STATUS_DETAILS: { [key: string]: { color: string, label: string } } = {
  PENDING:    { color: '#f59e0b', label: 'Planifiées' },
  IN_PROGRESS:{ color: '#3b82f6', label: 'En cours' },
  COMPLETED:  { color: '#22c55e', label: 'Terminées' },
  VALIDATED:  { color: '#8b5cf6', label: 'Validées' },
  CANCELLED:  { color: '#ef4444', label: 'Annulées' },
};

// 2. Créer un composant pour la légende personnalisée
const CustomLegend = ({ payload }: any) => {
  if (!payload || !payload.length) {
    return null;
  }
  return (
    <ul className="flex justify-center flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-gray-600 dark:text-dark-subtle">
      {
        payload.map((entry: any, index: number) => {
          const statusKey = entry.payload.name;
          const details = STATUS_DETAILS[statusKey];
          return (
            <li key={`item-${index}`} className="flex items-center">
              <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: details.color }}></span>
              <span>{details.label}</span>
            </li>
          );
        })
      }
    </ul>
  );
};


export const MissionStatusChart = ({ data }: { data: MissionStatusData[] }) => {
  
  // S'assurer que les données ont un nom valide avant de les afficher
  const filteredData = data.filter(entry => STATUS_DETAILS[entry.name]);

  return (
    <div className="bg-white dark:bg-dark-container rounded-lg shadow-md p-6 h-[350px] flex flex-col">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text mb-4">
        Répartition des Missions
      </h3>
      {filteredData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={filteredData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              innerRadius={50} // Ajout pour un effet "Donut" plus moderne
              fill="#8884d8"
              paddingAngle={5} // Ajout d'un espacement entre les tranches
              dataKey="value"
              nameKey="name"
            >
              {filteredData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={STATUS_DETAILS[entry.name]?.color || '#8884d8'} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [value, STATUS_DETAILS[name as string]?.label || name]}
              contentStyle={{
                backgroundColor: 'rgba(30, 41, 59, 0.9)',
                borderColor: '#334155',
                color: '#ffffff',
                borderRadius: '0.5rem'
              }}
            />
            {/* 3. Utiliser notre légende personnalisée */}
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
            <p>Aucune donnée de mission disponible.</p>
        </div>
      )}
    </div>
  );
};