"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import bcrypt from 'bcrypt';
import { employeeFormSchema } from "@/lib/validations";

export async function saveEmployee(data: any) {
  const validation = employeeFormSchema.safeParse(data);

  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message };
  }
  
  const { id, firstName, lastName, email, phone, password, role, type, departmentId, defaultPayRateId, salaireDeBase, numeroCNSS, numeroCIN } = validation.data;
  
  const phoneValue = phone?.trim() === '' ? null : phone;
  const payRateIdValue = defaultPayRateId?.trim() === '' ? null : defaultPayRateId;
  const departmentIdValue = departmentId?.trim() === '' ? null : departmentId;
  const salaireDeBaseValue = salaireDeBase ? parseFloat(salaireDeBase.replace(',', '.')) : null;

  try {
    if (id) {
      const employee = await prisma.employee.findUnique({ where: { id }});
      if (!employee) throw new Error("Employé non trouvé");

      await prisma.$transaction([
        prisma.user.update({
          where: { id: employee.userId },
          data: {
            name: `${firstName} ${lastName}`,
            email,
            role,
            departmentId: departmentIdValue,
            password: password ? await bcrypt.hash(password, 10) : undefined,
          }
        }),
        prisma.employee.update({
          where: { id: id },
          data: {
            firstName,
            lastName,
            phone: phoneValue,
            type,
            defaultPayRateId: payRateIdValue,
            salaireDeBase: salaireDeBaseValue,
            numeroCNSS: numeroCNSS || null,
            numeroCIN: numeroCIN || null,
          }
        })
      ]);
    } else {
      const hashedPassword = await bcrypt.hash(password!, 10);
      
      await prisma.user.create({
        data: {
          email,
          name: `${firstName} ${lastName}`,
          password: hashedPassword,
          role,
          departmentId: departmentIdValue,
          employee: {
            create: {
              firstName,
              lastName,
              phone: phoneValue,
              type,
              defaultPayRateId: payRateIdValue,
              salaireDeBase: salaireDeBaseValue,
              numeroCNSS: numeroCNSS || null,
              numeroCIN: numeroCIN || null,
            }
          }
        }
      });
    }

    revalidatePath("/administration/employees");
    revalidatePath("/administration/settings");
    return { success: true };

  } catch (error) {
    console.error("Erreur sauvegarde employé:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { success: false, error: "Un utilisateur avec cet email existe déjà." };
    }
    return { success: false, error: "Une erreur est survenue." };
  }
}

export async function deleteEmployee(id: string) {
    if (!id) {
        return { success: false, error: "ID manquant." };
    }
    try {
        const employee = await prisma.employee.findUnique({ where: { id } });
        if (!employee) return { success: false, error: "Employé introuvable." };
        
        await prisma.user.delete({ where: { id: employee.userId } });

        revalidatePath("/administration/employees");
        revalidatePath("/administration/settings");
        return { success: true };
    } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2003') {
            return { success: false, error: "Impossible de supprimer: cet employé est lié à des missions." };
          }
        }
        return { success: false, error: "Une erreur est survenue." };
    }
}