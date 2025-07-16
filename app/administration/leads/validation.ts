// app/administration/leads/validation.ts
import { z } from "zod";
import { LeadCanal, LeadType } from "@prisma/client";

export const leadSchema = z.object({
  contactName: z.string().min(3, { message: "Le nom du contact doit contenir au moins 3 caractères." }),
  companyName: z.string().optional(),
  email: z.string().email({ message: "Veuillez entrer une adresse email valide." }).optional().or(z.literal('')),
  phone: z.string().optional(),
  canal: z.nativeEnum(LeadCanal),
  type: z.nativeEnum(LeadType),
  source: z.string().optional(),
  notes: z.string().optional(),
}).required();

export type LeadFormValues = z.infer<typeof leadSchema>;