// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

// Déclare une seule fois pour le "singleton"
declare global {
  var prisma: PrismaClient | undefined
}

// Crée l'instance de Prisma, en la réutilisant en développement pour éviter de créer trop de connexions
const prisma = globalThis.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

export default prisma