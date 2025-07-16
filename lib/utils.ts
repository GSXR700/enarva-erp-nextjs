// lib/utils.ts

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Fusionne des classes Tailwind de manière conditionnelle et intelligente,
 * en évitant les conflits de style.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}