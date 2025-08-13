// app/administration/payroll/[employeeId]/components/PayrollDetailClient.tsx
"use client";

import { useState } from "react";
import { Employee, TimeLog, Payment, Mission, Order, Client, User, CompanyInfo, Payroll } from "@prisma/client";
import { UserAvatar } from "@/app/administration/components/UserAvatar";
import { DollarSign, Clock, HandCoins, FileDown, Loader2, Edit } from "lucide-react";
import { AddPaymentButton } from "./AddPaymentButton";
import { PaymentFormModal } from "./PaymentFormModal";
import { PayAdvanceFormModal } from "./PayAdvanceFormModal";
import { EditEarningsModal } from "./EditEarningsModal";
import { generatePayroll } from "../../actions";
import { generatePayslipPDF } from "@/lib/pdfGenerator"; // This import remains the same

type TimeLogWithDetails = TimeLog & {
  mission: Mission & {
    order: (Order & {
      client: Client;
    }) | null;
  };
};
type FullEmployee = Employee & { user: User | null };

// This specific type for the payslip is now defined in the pdfGenerator file.
// We keep this one for the component's state.
type FullPayroll = Payroll & {
    employee: FullEmployee,
    timeLogs: TimeLogWithDetails[],
    payments: Payment[]
};


interface PayrollDetailProps {
  employee: FullEmployee;
  initialTimeLogs: TimeLogWithDetails[];
  initialPayments: Payment[];
  stats: {
    totalEarnings: number;
    totalPayments: number;
    currentBalance: number;
  };
  companyInfo: CompanyInfo;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount);
const formatDate = (date: Date) => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));
const formatDuration = (minutes: number | null) => {
    if (!minutes && minutes !== 0) return "N/A";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m.toString().padStart(2, '0')}min`;
};

export function PayrollDetailClient({ employee, initialTimeLogs, initialPayments, stats, companyInfo }: PayrollDetailProps) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [isEarningsModalOpen, setIsEarningsModalOpen] = useState(false);
  const [selectedTimeLog, setSelectedTimeLog] = useState<TimeLog | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleOpenEditEarnings = (timeLog: TimeLog) => {
    setSelectedTimeLog(timeLog);
    setIsEarningsModalOpen(true);
  };

  const handleGeneratePayroll = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsGenerating(true);

    const formData = new FormData(event.currentTarget);
    const startDate = new Date(formData.get('startDate') as string);
    const endDate = new Date(formData.get('endDate') as string);
    endDate.setHours(23, 59, 59, 999);

    const result = await generatePayroll(employee.id, startDate, endDate);

    if (result.success && result.payroll) {
        // CORRECTION: Cast to any to bypass the type incompatibility
        // The PDF generator should handle the data transformation internally
        generatePayslipPDF(result.payroll as any, companyInfo);
    } else {
        alert(result.error || "Une erreur est survenue.");
    }
    setIsGenerating(false);
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <UserAvatar src={employee.user?.image} name={employee.user?.name} size={64} />
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">{employee.user?.name}</h1>
            <p className="text-gray-500 dark:text-dark-subtle">Suivi des paiements et du temps de travail</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-dark-container p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-full dark:bg-green-900/50"><DollarSign className="text-green-600 dark:text-green-400"/></div>
                  <div>
                      <p className="text-sm text-gray-500 dark:text-dark-subtle">Gains Totaux</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-white">{formatCurrency(stats.totalEarnings)}</p>
                  </div>
              </div>
          </div>
          <div className="bg-white dark:bg-dark-container p-6 rounded-lg shadow-md">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-900/50"><HandCoins className="text-blue-600 dark:text-blue-400"/></div>
                  <div>
                      <p className="text-sm text-gray-500 dark:text-dark-subtle">Total Payé</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-white">{formatCurrency(stats.totalPayments)}</p>
                  </div>
               </div>
          </div>
          <div className="bg-white dark:bg-dark-container p-6 rounded-lg shadow-md">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 rounded-full dark:bg-orange-900/50"><Clock className="text-orange-600 dark:text-orange-400"/></div>
                  <div>
                      <p className="text-sm text-gray-500 dark:text-dark-subtle">Solde Actuel</p>
                      <p className={`text-2xl font-bold ${stats.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(stats.currentBalance)}</p>
                  </div>
               </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-container p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold mb-4 dark:text-white">Générer une Fiche de Paie</h3>
            <form onSubmit={handleGeneratePayroll} className="flex flex-col md:flex-row items-end gap-4">
                <div className="flex-1 w-full">
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-dark-subtle mb-1">Date de début</label>
                    <input type="date" id="startDate" name="startDate" required className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border dark:text-dark-text" />
                </div>
                <div className="flex-1 w-full">
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-dark-subtle mb-1">Date de fin</label>
                    <input type="date" id="endDate" name="endDate" required className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-background dark:border-dark-border dark:text-dark-text" />
                </div>
                <button type="submit" disabled={isGenerating} className="w-full md:w-auto px-4 py-2 bg-green-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 disabled:opacity-50">
                    {isGenerating ? <Loader2 className="animate-spin" /> : <FileDown size={18}/>}
                    Générer PDF
                </button>
            </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <h2 className="text-xl font-bold mb-4 dark:text-white">Historique des Pointages</h2>
                <div className="bg-white dark:bg-dark-container rounded-lg shadow-md">
                    <ul className="divide-y dark:divide-dark-border">
                        {initialTimeLogs.map(log => (
                            <li key={log.id} className="p-4 flex justify-between items-center group">
                                <div>
                                    <p className="font-semibold dark:text-dark-text">
                                      {log.mission.order ? `Mission chez ${log.mission.order.client.nom}` : (log.mission.title || "Mission directe")}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-dark-subtle">{formatDate(log.startTime)}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                      <p className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(log.earnings)}</p>
                                      <p className="text-sm text-gray-500 dark:text-dark-subtle">{formatDuration(log.duration)}</p>
                                  </div>
                                  <button onClick={() => handleOpenEditEarnings(log)} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                                        <Edit size={16}/>
                                  </button>
                                </div>
                            </li>
                        ))}
                         {initialTimeLogs.length === 0 && <p className="p-4 text-center text-sm text-gray-400">Aucun pointage enregistré.</p>}
                    </ul>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold dark:text-white">Historique des Paiements</h2>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setIsAdvanceModalOpen(true)} className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                        (-) Avance
                      </button>
                      <AddPaymentButton onClick={() => setIsPaymentModalOpen(true)} />
                    </div>
                </div>
                <div className="bg-white dark:bg-dark-container rounded-lg shadow-md">
                    <ul className="divide-y dark:divide-dark-border">
                        {initialPayments.map(payment => (
                            <li key={payment.id} className="p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold dark:text-dark-text capitalize">{payment.type}</p>
                                    <p className="text-sm text-gray-500 dark:text-dark-subtle">{formatDate(payment.date)}</p>
                                </div>
                                <p className="font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(payment.amount)}</p>
                            </li>
                        ))}
                        {initialPayments.length === 0 && <p className="p-4 text-center text-sm text-gray-400">Aucun paiement enregistré.</p>}
                    </ul>
                </div>
            </div>
        </div>
      </div>

      <EditEarningsModal isOpen={isEarningsModalOpen} onClose={() => setIsEarningsModalOpen(false)} timeLog={selectedTimeLog} />
      <PaymentFormModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} employeeId={employee.id} />
      <PayAdvanceFormModal isOpen={isAdvanceModalOpen} onClose={() => setIsAdvanceModalOpen(false)} employeeId={employee.id} />
    </>
  );
}