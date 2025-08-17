// app/administration/payroll/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { Prisma, MissionStatus, PayRateType } from "@prisma/client";
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
    try {
        console.log(`🔍 punchTimesheet called: employee ${employeeId}, mission ${missionId}`);
        
        const mission = await prisma.mission.findUnique({
            where: { id: missionId },
            include: {
                assignedTo: {
                    include: {
                        defaultPayRate: true,
                        user: { select: { name: true } }
                    }
                },
                order: {
                    include: {
                        client: { select: { nom: true } }
                    }
                }
            }
        });

        if (!mission) {
            console.log(`❌ Mission ${missionId} not found`);
            return { success: false, error: "Mission introuvable." };
        }

        // Verify employee is assigned to this mission
        if (mission.assignedToId !== employeeId) {
            console.log(`❌ Employee ${employeeId} not assigned to mission ${missionId}`);
            return { 
                success: false, 
                error: "Vous n'êtes pas assigné à cette mission." 
            };
        }

        console.log(`📋 Mission status before: ${mission.status}`);
        const now = new Date();

        if (mission.status === MissionStatus.PENDING) {
            // START MISSION: PENDING → IN_PROGRESS
            await prisma.$transaction(async (tx) => {
                await tx.mission.update({
                    where: { id: missionId },
                    data: { 
                        status: MissionStatus.IN_PROGRESS, 
                        actualStart: now 
                    }
                });

                await tx.timeLog.create({
                    data: {
                        startTime: now,
                        missionId: missionId,
                        employeeId: employeeId,
                    }
                });
            });

            console.log(`✅ Mission ${missionId} started: PENDING → IN_PROGRESS`);

        } else if (mission.status === MissionStatus.IN_PROGRESS) {
            // STOP MISSION: IN_PROGRESS → APPROBATION
            
            // First, try to find an active timeLog
            let timeLog = await prisma.timeLog.findFirst({
                where: { 
                    missionId: missionId, 
                    employeeId: employeeId,
                    endTime: null 
                },
                orderBy: { startTime: 'desc' }
            });

            // If no active timeLog found, check if mission was started without proper timeLog
            if (!timeLog) {
                console.log(`⚠️ No active timeLog found for mission ${missionId}. Checking for data inconsistency...`);
                
                // Look for any timeLog for this mission/employee (even completed ones)
                const anyTimeLog = await prisma.timeLog.findFirst({
                    where: { 
                        missionId: missionId, 
                        employeeId: employeeId
                    },
                    orderBy: { startTime: 'desc' }
                });

                if (anyTimeLog) {
                    console.log(`🔧 Found existing timeLog ${anyTimeLog.id}, but it's already closed. Creating recovery timeLog...`);
                } else {
                    console.log(`🔧 No timeLog found at all. Mission status inconsistent. Creating recovery timeLog...`);
                }

                // Create a recovery timeLog with start time based on actualStart or estimated time
                const startTime = mission.actualStart || new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago as fallback

                timeLog = await prisma.timeLog.create({
                    data: {
                        startTime: startTime,
                        missionId: missionId,
                        employeeId: employeeId,
                    }
                });

                console.log(`✅ Recovery timeLog created with ID ${timeLog.id}`);
            }

            // Calculate duration and earnings
            const durationInMinutes = Math.round(
                (now.getTime() - timeLog.startTime.getTime()) / (1000 * 60)
            );
            const durationInHours = durationInMinutes / 60;
            let earnings = 0;
            const payRate = mission.assignedTo.defaultPayRate;

            if (payRate) {
                switch (payRate.type) {
                    case "PER_HOUR":
                        earnings = payRate.amount * durationInHours;
                        break;
                    case "PER_DAY":
                        earnings = durationInHours >= 4 
                            ? payRate.amount 
                            : (payRate.amount / 8) * durationInHours;
                        break;
                    case "PER_MISSION":
                        earnings = payRate.amount;
                        break;
                    default:
                        earnings = 0;
                }
            }

            await prisma.$transaction(async (tx) => {
                // Update mission status to APPROBATION
                await tx.mission.update({
                    where: { id: missionId },
                    data: { 
                        status: MissionStatus.APPROBATION, 
                        actualEnd: now 
                    }
                });

                // Complete the timeLog
                await tx.timeLog.update({
                    where: { id: timeLog.id },
                    data: {
                        endTime: now,
                        duration: durationInMinutes,
                        earnings: parseFloat(earnings.toFixed(2)),
                    }
                });
            });

            console.log(`✅ Mission ${missionId} completed: IN_PROGRESS → APPROBATION (duration: ${durationInMinutes}min, earnings: ${earnings.toFixed(2)})`);

            // Notify admins and managers
            try {
                const adminsAndManagers = await prisma.user.findMany({
                    where: { role: { in: ['ADMIN', 'MANAGER'] } }
                });

                const missionTitle = mission.order?.client?.nom || mission.title || "une mission";
                const employeeName = mission.assignedTo.user?.name || `${mission.assignedTo.firstName} ${mission.assignedTo.lastName}`;

                for (const user of adminsAndManagers) {
                    await createAndEmitNotification({
                        userId: user.id,
                        message: `La mission chez <b>${missionTitle}</b> par <b>${employeeName}</b> est terminée et attend votre approbation.`,
                        link: `/administration/missions/${missionId}`,
                        type: 'TASK',
                        priority: 'MEDIUM'
                    });
                }
                console.log(`📧 Notifications sent to ${adminsAndManagers.length} managers`);
            } catch (notificationError) {
                console.error("Error sending notifications:", notificationError);
                // Don't fail the whole operation if notifications fail
            }

        } else {
            console.log(`❌ Invalid status transition from ${mission.status}`);
            return { 
                success: false, 
                error: `Action non autorisée pour une mission avec le statut ${mission.status}.` 
            };
        }

        // Revalidate relevant paths
        revalidatePath(`/administration/payroll/${employeeId}`);
        revalidatePath(`/administration/missions`);
        revalidatePath(`/administration/missions/${missionId}`);
        revalidatePath(`/api/missions/employee/${employeeId}`);
        revalidatePath(`/mobile`);
        
        console.log(`🔄 Paths revalidated for employee ${employeeId}`);
        return { success: true };

    } catch (error) {
        console.error("❌ Error in punchTimesheet:", error);
        return { 
            success: false, 
            error: "Une erreur système est survenue lors du pointage." 
        };
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
            const document = await tx.generatedDocument.create({
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