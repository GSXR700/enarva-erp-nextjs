import prisma from "@/lib/prisma";
import { MissionStatus, PayRateType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { createAndEmitNotification } from "@/lib/notificationService";

async function getNextPayrollNumber() {
    const year = new Date().getFullYear();
    const lastPayroll = await prisma.payroll.findFirst({
        where: { payrollNumber: { endsWith: `/${year}` } },
        orderBy: { id: 'desc' },
    });

    let sequence = 1;
    if (lastPayroll?.payrollNumber) {
        const match = lastPayroll.payrollNumber.match(/-(\d+)\//);
        if (match && match[1]) {
            sequence = parseInt(match[1], 10) + 1;
        }
    }
    return `FP-${sequence}/${year}`;
}

export async function punchTimesheet(employeeId: string, missionId: string) {
    const mission = await prisma.mission.findUnique({
        where: { id: missionId },
        include: {
            assignedTo: {
                include: {
                    defaultPayRate: true,
                }
            },
            order: {
                include: {
                    client: true
                }
            }
        }
    });
    if (!mission) {
        return { success: false, error: "Mission introuvable." };
    }

    const now = new Date();

    try {
        if (mission.status === MissionStatus.PENDING) {
            await prisma.$transaction([
                prisma.mission.update({
                    where: { id: missionId },
                    data: { status: MissionStatus.IN_PROGRESS, actualStart: now }
                }),
                prisma.timeLog.create({
                    data: {
                        startTime: now,
                        missionId: missionId,
                        employeeId: employeeId,
                    }
                })
            ]);
        } else if (mission.status === MissionStatus.IN_PROGRESS) {
            const timeLog = await prisma.timeLog.findFirst({
                where: { missionId: missionId, endTime: null },
                orderBy: { startTime: 'desc' }
            });

            if (!timeLog) {
                return { success: false, error: "Pointage de début introuvable." };
            }

            const durationInMinutes = Math.round((now.getTime() - timeLog.startTime.getTime()) / (1000 * 60));
            const durationInHours = durationInMinutes / 60;
            let earnings = 0;
            
            // --- CORRECTION CRITIQUE : Accès sécurisé au tarif par défaut ---
            // L'opérateur de chaînage optionnel (?.) évite une erreur si `defaultPayRate` est null.
            const payRate = mission.assignedTo?.defaultPayRate;

            if (payRate) {
                // FIX: Use the imported PayRateType enum directly for better type safety
                switch (payRate.type) {
                    case PayRateType.PER_HOUR:
                        earnings = payRate.amount * durationInHours;
                        break;
                    case PayRateType.PER_DAY:
                        earnings = (durationInHours >= 4) ? payRate.amount : (payRate.amount / 8) * durationInHours;
                        break;
                    case PayRateType.PER_MISSION:
                        earnings = payRate.amount;
                        break;
                    default:
                        earnings = 0;
                }
            }

            await prisma.$transaction([
                prisma.mission.update({
                    where: { id: missionId },
                    data: { status: MissionStatus.APPROBATION, actualEnd: now }
                }),
                prisma.timeLog.update({
                    where: { id: timeLog.id },
                    data: {
                        endTime: now,
                        duration: durationInMinutes,
                        earnings: parseFloat(earnings.toFixed(2)),
                    }
                })
            ]);

            const adminsAndManagers = await prisma.user.findMany({
                where: { role: { in: ['ADMIN', 'MANAGER'] } }
            });

            const missionTitle = mission.order?.client?.nom || mission.title || "une mission";

            for (const user of adminsAndManagers) {
                await createAndEmitNotification({
                    userId: user.id,
                    message: `La mission chez <b>${missionTitle}</b> est terminée et attend votre approbation.`,
                    link: `/administration/missions/${missionId}`
                });
            }
        } else {
            return { success: false, error: `Action non autorisée pour une mission avec le statut ${mission.status}.` };
        }

        revalidatePath(`/administration/payroll/${employeeId}`);
        revalidatePath(`/administration/missions`);
        return { success: true };
    } catch (error) {
        console.error("Erreur de pointage:", error);
        return { success: false, error: "Une erreur est survenue lors du pointage." };
    }
}

export async function recordPayment(formData: FormData) {
    const employeeId = formData.get('employeeId') as string;
    const amountStr = formData.get('amount') as string;
    const dateStr = formData.get('date') as string;
    const type = formData.get('type') as string;
    const notes = formData.get('notes') as string;

    if (!employeeId || !amountStr || !dateStr || !type) {
        return { success: false, error: "Données manquantes." };
    }

    const amount = parseFloat(amountStr.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
        return { success: false, error: "Le montant est invalide." };
    }

    try {
        await prisma.payment.create({
            data: {
                employeeId,
                amount,
                type,
                date: new Date(dateStr),
                notes: notes || null,
            }
        });

        revalidatePath(`/administration/payroll/${employeeId}`);
        return { success: true, message: "Paiement enregistré avec succès !" };

    } catch (error) {
        console.error("Erreur d'enregistrement du paiement:", error);
        return { success: false, error: "Une erreur serveur est survenue." };
    }
}

export async function updateTimeLogEarnings(formData: FormData) {
  const timeLogId = formData.get('timeLogId') as string;
  const earningsStr = formData.get('earnings') as string;
  const employeeId = formData.get('employeeId') as string;

  if (!timeLogId || !earningsStr || !employeeId) {
    return { success: false, error: "Données manquantes." };
  }

  const earnings = parseFloat(earningsStr.replace(',', '.'));
  if (isNaN(earnings) || earnings < 0) {
    return { success: false, error: "Le montant des gains est invalide." };
  }

  try {
    await prisma.timeLog.update({
      where: { id: timeLogId },
      data: { earnings },
    });

    revalidatePath(`/administration/payroll/${employeeId}`);
    return { success: true, message: "Gains mis à jour avec succès !" };
  } catch (error) {
    console.error("Erreur lors de la mise à jour des gains:", error);
    return { success: false, error: "Une erreur est survenue." };
  }
}

export async function generatePayroll(employeeId: string, periodStart: Date, periodEnd: Date) {
    if (!employeeId || !periodStart || !periodEnd) {
        return { success: false, error: "Données manquantes pour générer la fiche de paie." };
    }

    try {
        const newPayroll = await prisma.$transaction(async (tx) => {
            const timeLogsToProcess = await tx.timeLog.findMany({
                where: {
                    employeeId,
                    payrollId: null,
                    startTime: { gte: periodStart, lte: periodEnd }
                },
                include: { mission: { include: { order: { select: { client: { select: { nom: true } } } } } } }
            });

            const paymentsToProcess = await tx.payment.findMany({
                where: {
                    employeeId,
                    payrollId: null,
                    date: { gte: periodStart, lte: periodEnd }
                }
            });

            const totalEarnings = timeLogsToProcess.reduce((sum, log) => sum + log.earnings, 0);
            const totalPayments = paymentsToProcess.reduce((sum, payment) => sum + payment.amount, 0);
            const balance = totalEarnings - totalPayments;

            const payrollNumber = await getNextPayrollNumber();

            const createdPayroll = await tx.payroll.create({
                data: {
                    payrollNumber: payrollNumber,
                    employeeId,
                    periodStart,
                    periodEnd,
                    totalDue: totalEarnings,
                    totalPaid: totalPayments,
                    balance,
                    status: "GENERATED"
                }
            });

            const timeLogIds = timeLogsToProcess.map(log => log.id);
            const paymentIds = paymentsToProcess.map(p => p.id);

            await tx.timeLog.updateMany({ where: { id: { in: timeLogIds } }, data: { payrollId: createdPayroll.id } });
            await tx.payment.updateMany({ where: { id: { in: paymentIds } }, data: { payrollId: createdPayroll.id } });

            return tx.payroll.findUnique({
                where: { id: createdPayroll.id },
                include: {
                    employee: { include: { user: true } },
                    timeLogs: { include: { mission: { include: { order: { select: { client: { select: { nom: true } } } } } } } },
                    payments: true,
                }
            });
        });

        revalidatePath(`/administration/payroll/${employeeId}`);
        return { success: true, payroll: newPayroll };

    } catch (error) {
        console.error("Erreur lors de la génération de la paie :", error);
        return { success: false, error: "Une erreur est survenue." };
    }
}

export async function recordPayAdvance(formData: FormData) {
  const employeeId = formData.get('employeeId') as string;
  const amountStr = formData.get('amount') as string;
  const reason = formData.get('reason') as string;

  if (!employeeId || !amountStr) {
    return { success: false, error: "L'employé et le montant sont requis." };
  }

  const amount = parseFloat(amountStr.replace(',', '.'));
  if (isNaN(amount) || amount <= 0) {
    return { success: false, error: "Le montant est invalide." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const document = await tx.generatedDocument.create({ // Correct model name
        data: {
          type: 'BCa',
          numero: `BCa-${Date.now()}`,
          pdfUrl: '',
        }
      });

      await tx.payAdvance.create({
        data: {
          employeeId,
          amount,
          date: new Date(),
          reason: reason || "Avance sur salaire",
          documentId: document.id,
        }
      });

      await tx.payment.create({
        data: {
          employeeId,
          amount,
          type: 'Avance',
          date: new Date(),
          notes: reason || "Avance sur salaire",
        }
      });
    });

    revalidatePath(`/administration/payroll/${employeeId}`);
    return { success: true, message: "Avance enregistrée avec succès !" };

  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'avance:", error);
    return { success: false, error: "Une erreur serveur est survenue." };
  }
}