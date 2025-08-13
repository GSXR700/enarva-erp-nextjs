// app/administration/payroll/[employeeId]/page.tsx
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PayrollDetailClient } from "./components/PayrollDetailClient";

export const dynamic = 'force-dynamic';

async function getEmployeePayrollData(employeeId: string) {
  const [employee, companyInfo] = await Promise.all([
    prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: true,
        timeLogs: {
          orderBy: { startTime: 'desc' },
          include: { mission: { include: { order: { include: { client: true } } } } }
        },
        payments: {
          orderBy: { date: 'desc' },
        }
      }
    }),
    prisma.companyInfo.findFirst()
  ]);


  if (!employee || !companyInfo) {
    return null;
  }

  const totalEarnings = employee.timeLogs.reduce((sum, log) => sum + log.earnings, 0);
  const totalPayments = employee.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const currentBalance = totalEarnings - totalPayments;

  return {
    employee,
    companyInfo,
    totalEarnings,
    totalPayments,
    currentBalance
  };
}

export default async function EmployeePayrollDetailPage({ params }: { params: { employeeId: string } }) {
  const data = await getEmployeePayrollData(params.employeeId);

  if (!data) {
    notFound();
  }

  return (
    <PayrollDetailClient
      employee={data.employee}
      initialTimeLogs={data.employee.timeLogs}
      initialPayments={data.employee.payments}
      stats={{
        totalEarnings: data.totalEarnings,
        totalPayments: data.totalPayments,
        currentBalance: data.currentBalance,
      }}
      companyInfo={data.companyInfo}
    />
  );
}