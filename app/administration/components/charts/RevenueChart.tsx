// app/administration/components/charts/RevenueChart.tsx
"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueData {
  name: string;
  total: number;
}

export const RevenueChart = ({ data }: { data: RevenueData[] }) => {
  return (
    <div className="bg-white dark:bg-dark-container rounded-lg shadow-md p-6 h-[350px]">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text mb-4">
        Revenus des 6 derniers mois
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: -10,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128, 128, 128, 0.2)" />
          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} MAD`} />
          <Tooltip
            cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}
            contentStyle={{
              backgroundColor: 'rgba(30, 41, 59, 0.9)',
              borderColor: '#334155',
              color: '#ffffff',
              borderRadius: '0.5rem'
            }}
          />
          <Bar dataKey="total" fill="#3C50E0" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};