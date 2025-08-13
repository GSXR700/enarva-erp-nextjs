// app/administration/settings/components/SettingsTabs.tsx
"use client";

import { useState } from "react";
import type { User, CompanyInfo, PayRate, Department, Service } from "@prisma/client";
import { ProfilePhotoUploader } from "./ProfilePhotoUploader";
import { CompanyInfoForm } from "./CompanyInfoForm";
import { UserManagement } from "./UserManagement";
import { PayRateManagement } from "./PayRateManagement";
import { DepartmentManagement } from "./DepartmentManagement";
import { ServiceManagement } from "./ServiceManagement";

interface SettingsTabsProps {
  users: User[];
  companyInfo: CompanyInfo;
  payRates: PayRate[];
  departments: Department[];
  services: Service[];
}

export function SettingsTabs({ users, companyInfo, payRates, departments, services }: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'Profil' },
    { id: 'company', label: 'Société' },
    { id: 'staff', label: 'Utilisateurs' },
    { id: 'organization', label: 'Organisation' },
    { id: 'services', label: 'Services' },
    { id: 'rates', label: 'Tarification' },
  ];

  return (
    <div>
      <div className="mb-6 border-b border-gray-200 dark:border-dark-border">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-dark-subtle">
          {tabs.map(tab => (
            <li key={tab.id} className="mr-2">
              <button
                onClick={() => setActiveTab(tab.id)}
                className={`inline-block p-4 border-b-2 rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary border-primary dark:text-blue-400 dark:border-blue-400'
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        {activeTab === 'general' && <ProfilePhotoUploader />}
        {activeTab === 'company' && <CompanyInfoForm companyInfo={companyInfo} />}
        {activeTab === 'staff' && <UserManagement users={users} />}
        {activeTab === 'organization' && <DepartmentManagement departments={departments} />}
        {activeTab === 'services' && <ServiceManagement services={services} departments={departments} />}
        {activeTab === 'rates' && <PayRateManagement payRates={payRates} />}
      </div>
    </div>
  );
}