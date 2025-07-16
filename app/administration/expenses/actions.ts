// enarva-nextjs-dashboard-app/app/administration/expenses/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Supplier Actions
export async function saveSupplier(formData: FormData) {
  const id = formData.get("id") as string;
  const data = {
    name: formData.get("name") as string,
    contact: formData.get("contact") as string || null,
    phone: formData.get("phone") as string || null,
    email: formData.get("email") as string || null,
    address: formData.get("address") as string || null,
  };

  if (!data.name) {
    return { success: false, error: "Le nom du fournisseur est obligatoire." };
  }

  try {
    if (id) {
      await prisma.supplier.update({
        where: { id },
        data
      });
    } else {
      await prisma.supplier.create({
        data
      });
    }
    revalidatePath("/administration/expenses");
    return { success: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return { success: false, error: "Un fournisseur avec ce nom existe déjà." };
      }
    }
    console.error("Erreur sauvegarde Fournisseur:", error);
    return { success: false, error: "Une erreur est survenue lors de la sauvegarde." };
  }
}

export async function deleteSupplier(id: string) {
  if (!id) return { success: false, error: "ID manquant." };
  
  try {
    // Check if supplier has related expenses
    const supplierWithExpenses = await prisma.supplier.findFirst({
      where: { id },
      include: { expenses: { take: 1 } }
    });

    if (supplierWithExpenses?.expenses.length) {
      return { 
        success: false, 
        error: "Ce fournisseur ne peut pas être supprimé car il a des dépenses associées." 
      };
    }

    await prisma.supplier.delete({ where: { id } });
    revalidatePath("/administration/expenses");
    return { success: true };
  } catch (error) {
    console.error("Erreur suppression Fournisseur:", error);
    return { success: false, error: "Une erreur est survenue lors de la suppression." };
  }
}

// Expense Actions
export async function getExpenses(page: number = 1, filters: any = {}) {
  const itemsPerPage = 10;
  const skip = (page - 1) * itemsPerPage;

  try {
    const where: any = {};
    
    if (filters.startDate && filters.endDate) {
      where.date = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate)
      };
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.supplierId) {
      where.supplierId = filters.supplierId;
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          supplier: true
        },
        orderBy: {
          date: 'desc'
        },
        skip,
        take: itemsPerPage
      }),
      prisma.expense.count({ where })
    ]);

    return {
      data: expenses,
      total,
      hasNextPage: skip + itemsPerPage < total,
      hasPrevPage: page > 1
    };
  } catch (error) {
    console.error("Erreur récupération Dépenses:", error);
    throw error;
  }
}

export async function saveExpense(formData: FormData) {
  const id = formData.get("id") as string;
  const data = {
    amount: parseFloat((formData.get("amount") as string).replace(',', '.')) || 0,
    date: new Date(formData.get("date") as string),
    category: formData.get("category") as string,
    description: formData.get("description") as string,
    receiptUrl: formData.get("receiptUrl") as string || null,
    supplierId: formData.get("supplierId") as string || null,
  };

  if (!data.amount || !data.date || !data.category || !data.description) {
    return { success: false, error: "Veuillez remplir tous les champs obligatoires." };
  }
  
  if (data.supplierId === "") {
    data.supplierId = null;
  }

  try {
    if (id) {
      await prisma.expense.update({ where: { id }, data });
    } else {
      await prisma.expense.create({ data });
    }
    revalidatePath("/administration/expenses");
    return { success: true };
  } catch (error) {
    console.error("Erreur sauvegarde Dépense:", error);
    return { success: false, error: "Une erreur est survenue lors de la sauvegarde." };
  }
}

export async function deleteExpense(id: string) {
  if (!id) return { success: false, error: "ID manquant." };
  
  try {
    await prisma.expense.delete({ where: { id } });
    revalidatePath("/administration/expenses");
    return { success: true };
  } catch (error) {
    console.error("Erreur suppression Dépense:", error);
    return { success: false, error: "Une erreur est survenue lors de la suppression." };
  }
}

export async function getExpenseStats() {
  try {
    // Get current month's start and end dates
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get total expenses for current month
    const monthlyTotal = await prisma.expense.aggregate({
      _sum: {
        amount: true
      },
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });

    // Get expenses by category for current month
    const categoryTotals = await prisma.expense.groupBy({
      by: ['category'],
      _sum: {
        amount: true
      },
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });

    // Get top suppliers by expense amount
    const topSuppliers = await prisma.supplier.findMany({
      take: 5,
      include: {
        _count: {
          select: { expenses: true }
        },
        expenses: {
          select: {
            amount: true
          }
        }
      },
      orderBy: {
        expenses: {
          _count: 'desc'
        }
      }
    });

    return {
      monthlyTotal: monthlyTotal._sum.amount || 0,
      categoryTotals: categoryTotals.map(cat => ({
        category: cat.category,
        total: cat._sum.amount || 0
      })),
      topSuppliers: topSuppliers.map(supplier => ({
        id: supplier.id,
        name: supplier.name,
        transactionCount: supplier._count.expenses,
        totalAmount: supplier.expenses.reduce((sum, exp) => sum + exp.amount, 0)
      }))
    };
  } catch (error) {
    console.error("Erreur récupération statistiques:", error);
    throw error;
  }
}