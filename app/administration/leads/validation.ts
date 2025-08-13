// app/administration/leads/validation.ts
import { z } from "zod";
import { LeadCanal, LeadType } from "@prisma/client";

export const leadSchema = z.object({
  nom: z.string().min(3, { message: "Le nom du contact doit contenir au moins 3 caractères." }),
  telephone: z.string().optional(),
  email: z.string().email({ message: "Veuillez entrer une adresse email valide." }).optional().or(z.literal('')),
  canal: z.nativeEnum(LeadCanal),
  type: z.nativeEnum(LeadType),
  source: z.string().optional(),
  quoteObject: z.string().min(5, { message: "L'objet du devis est requis et doit être descriptif." }),
  commentaire: z.string().optional(),
  assignedToId: z.string().optional(),
  subcontractorAsSourceId: z.string().optional(),
  // --- ADDED NEW DATE FIELDS ---
  date_intervention: z.string().optional(),
  date_cloture: z.string().optional(),
});

export type LeadFormValues = z.infer<typeof leadSchema>;