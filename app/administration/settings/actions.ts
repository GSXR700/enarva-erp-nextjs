// enarva-nextjs-dashboard-app/app/administration/settings/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { Prisma, Role, PayRateType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from 'bcrypt';

// Action pour créer ou mettre à jour un utilisateur
export async function saveUser(formData: FormData) {
  const id = formData.get("id") as string;
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const role = formData.get("role") as Role;
  const password = formData.get("password") as string;
  const phone = formData.get("phone") as string;

  if (!email || !name || !role) {
    return { success: false, error: "Le nom, l'email et le rôle sont requis." };
  }

  const [firstName, ...lastNameParts] = name.split(' ');
  const lastName = lastNameParts.join(' ');
  const phoneValue = phone && phone.trim() ? phone : null;

  try {
    if (id) {
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id },
          data: {
            name,
            email,
            role,
            password: password ? await bcrypt.hash(password, 10) : undefined,
          },
        });

        const employee = await tx.employee.findUnique({ where: { userId: id }});
        if (employee) {
          await tx.employee.update({
            where: { id: employee.id },
            data: { firstName, lastName, phone: phoneValue },
          });
        }
      });
    } else {
      if (!password) {
        return { success: false, error: "Le mot de passe est requis." };
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const userData: Prisma.UserCreateInput = {
        name,
        email,
        role,
        password: hashedPassword,
      };

      if (role === Role.FIELD_WORKER) {
        userData.employee = {
          create: {
            firstName,
            lastName,
            phone: phoneValue,
          }
        }
      }
      await prisma.user.create({ data: userData });
    }
    
    revalidatePath("/administration/settings");
    revalidatePath("/administration/employees");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la sauvegarde:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { success: false, error: "Un utilisateur avec cet email existe déjà." };
    }
    return { success: false, error: "Une erreur est survenue." };
  }
}

// Action pour mettre à jour la photo de profil
export async function updateProfilePicture(imageUrl: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
    });

    revalidatePath("/administration/settings");
    return { success: true };
  } catch (error) {
    console.error("Erreur de mise à jour de la photo:", error);
    return { success: false, error: "Erreur serveur." };
  }
}

// Action pour supprimer un utilisateur
export async function deleteUser(id: string) {
    if (!id) {
        return { success: false, error: "ID manquant." };
    }
    const userToDelete = await prisma.user.findUnique({ where: { id }});
    if (userToDelete?.role === 'ADMIN') {
        const adminCount = await prisma.user.count({ where: { role: 'ADMIN' }});
        if (adminCount <= 1) {
            return { success: false, error: "Impossible de supprimer le dernier administrateur." };
        }
    }
    try {
        await prisma.user.delete({ where: { id } });
        revalidatePath("/administration/settings");
        revalidatePath("/administration/employees");
        return { success: true };
    } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        return { success: false, error: "Une erreur est survenue." };
    }
}

// Action pour mettre à jour les informations de l'entreprise
export async function saveCompanyInfo(formData: FormData) {
  try {
    const data = {
      companyName: formData.get("companyName") as string,
      address: formData.get("address") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      website: formData.get("website") as string,
      rc: formData.get("rc") as string,
      if: formData.get("if") as string,
      ice: formData.get("ice") as string,
      rib: formData.get("rib") as string,
    };
    
    await prisma.companyInfo.updateMany({ data });

    revalidatePath("/administration/settings");
    return { success: true, message: "Informations mises à jour avec succès." };
  } catch (error) {
    console.error("Erreur lors de la mise à jour des informations:", error);
    return { success: false, error: "Une erreur est survenue sur le serveur." };
  }
}

// --- NOUVELLES FONCTIONS POUR LES TARIFS ---

export async function savePayRate(formData: FormData) {
  const id = formData.get("id") as string | undefined;
  const name = formData.get("name") as string;
  const amountStr = formData.get("amount") as string;
  const type = formData.get("type") as PayRateType;
  const description = formData.get("description") as string;

  if (!name || !amountStr || !type) {
    return { success: false, error: "Tous les champs sont requis." };
  }

  const amount = parseFloat(amountStr.replace(',', '.'));
  if (isNaN(amount)) {
    return { success: false, error: "Le montant est invalide." };
  }

  const data = { name, amount, type, description: description || null };

  try {
    if (id) {
      await prisma.payRate.update({ where: { id }, data });
    } else {
      await prisma.payRate.create({ data });
    }
    revalidatePath("/administration/settings");
    return { success: true };
  } catch (error) {
    console.error("Erreur sauvegarde PayRate:", error);
    return { success: false, error: "Une erreur est survenue." };
  }
}

export async function deletePayRate(id: string) {
  if (!id) {
    return { success: false, error: "ID manquant." };
  }
  try {
    await prisma.payRate.delete({ where: { id } });
    revalidatePath("/administration/settings");
    return { success: true };
  } catch (error) {
    console.error("Erreur suppression PayRate:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return { success: false, error: "Impossible de supprimer ce tarif car il est utilisé par des missions ou employés." };
    }
    return { success: false, error: "Une erreur est survenue." };
  }
}

export async function saveDepartment(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name) {
    return { success: false, error: "Le nom du département est requis." };
  }

  const data = { name, description: description || null };

  try {
    if (id) {
      await prisma.department.update({ where: { id }, data });
    } else {
      await prisma.department.create({ data });
    }
    revalidatePath("/administration/settings");
    return { success: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { success: false, error: "Un département avec ce nom existe déjà." };
    }
    return { success: false, error: "Une erreur est survenue." };
  }
}

export async function deleteDepartment(id: string) {
  if (!id) return { success: false, error: "ID manquant." };
  try {
    const departmentWithRelations = await prisma.department.findUnique({
      where: { id },
      include: { _count: { select: { users: true, services: true } } },
    });
    
    // CORRECTION DÉFINITIVE : Vérification explicite en plusieurs étapes
    if (departmentWithRelations && departmentWithRelations._count) {
      if (departmentWithRelations._count.users > 0 || departmentWithRelations._count.services > 0) {
        return { success: false, error: "Impossible de supprimer ce département car il est lié à des utilisateurs ou des services." };
      }
    }

    await prisma.department.delete({ where: { id } });
    revalidatePath("/administration/settings");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression du département:", error);
    return { success: false, error: "Une erreur est survenue." };
  }
}

// ... (code existant de saveUser, deleteDepartment, etc.)

// --- NOUVELLES FONCTIONS POUR LES SERVICES ---

export async function saveService(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const family = formData.get("family") as string;
  const description = formData.get("description") as string;
  const departmentId = formData.get("departmentId") as string;

  if (!name || !family || !description || !departmentId) {
    return { success: false, error: "Tous les champs sont requis." };
  }

  const data = { name, family, description, departmentId };

  try {
    if (id) {
      await prisma.service.update({ where: { id }, data });
    } else {
      await prisma.service.create({ data });
    }
    revalidatePath("/administration/settings");
    return { success: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { success: false, error: "Un service avec ce nom existe déjà." };
    }
    return { success: false, error: "Une erreur est survenue." };
  }
}

export async function deleteService(id: string) {
  if (!id) return { success: false, error: "ID manquant." };
  try {
    // Note : si des devis ou autres objets sont liés à ce service,
    // il faudrait ajouter ici une vérification pour empêcher la suppression.
    await prisma.service.delete({ where: { id } });
    revalidatePath("/administration/settings");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Une erreur est survenue." };
  }
}