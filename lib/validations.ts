import { z } from "zod";
import { ClientType, ClientStatus, PaymentMode, Role, EmployeeType, JuridicState, QuoteStatus } from "@prisma/client";

// Schéma pour le formulaire client
export const clientSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  email: z.string().email("L'email n'est pas valide").optional().nullable(),
  telephone: z.string().optional().nullable(),
  adresse: z.string().optional().nullable(),
  secteur: z.string().optional().nullable(),
  contact_secondaire: z.string().optional().nullable(),
  type: z.nativeEnum(ClientType), // REQUIRED
  statut: z.nativeEnum(ClientStatus), // REQUIRED
  mode_paiement_prefere: z.nativeEnum(PaymentMode).optional().nullable(),
  contrat_en_cours: z.boolean(), // REQUIRED
  id: z.string().optional(),
});

export type ClientFormValues = z.infer<typeof clientSchema>;

// Types pour les éléments du devis
const quoteItemSchema = z.object({
  designation: z.string().min(1, "La désignation est requise."),
  quantity: z.string().min(1, "La quantité est requise.").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "La quantité doit être un nombre positif"
  ),
  unitPrice: z.string().min(1, "Le prix unitaire est requis.").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
    "Le prix unitaire doit être un nombre positif ou nul"
  ),
  total: z.number().min(0, "Le total doit être positif ou nul"),
});

export type QuoteItem = z.infer<typeof quoteItemSchema>;

// Schéma principal pour les devis
export const quoteFormSchema = z.object({
  id: z.string().optional(),
  clientId: z.string().min(1, "Le client est requis"),
  date: z.string().min(1, "La date est requise").refine(
    (val) => !isNaN(Date.parse(val)),
    "La date n'est pas valide"
  ),
  object: z.string().optional().nullable(),
  juridicState: z.nativeEnum(JuridicState).describe("L'état juridique est requis"),
  personnelMobilise: z.string().trim().optional().nullable(),
  equipementsUtilises: z.string().trim().optional().nullable(),
  prestationsIncluses: z.string().trim().optional().nullable(),
  delaiPrevu: z.string().trim().optional().nullable(),
  items: z.string().min(1, "Le devis doit contenir au moins une ligne").refine(
    (val) => {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) && parsed.length > 0 && 
          parsed.every(item => quoteItemSchema.safeParse(item).success);
      } catch (e) {
        return false;
      }
    },
    { message: "Les lignes du devis ne sont pas valides" }
  ),
  status: z.nativeEnum(QuoteStatus).refine(
    (status) => ['DRAFT', 'SENT'].includes(status),
    { message: "Le statut n'est pas valide pour cette action" }
  ),
});

export type QuoteFormData = z.infer<typeof quoteFormSchema>;

const PASSWORD_MIN_LENGTH = 8;
const PHONE_REGEX = /^(?:\+212|0)[567]\d{8}$/;

export const employeeFormSchema = z.object({
    id: z.string().optional(),
    firstName: z.string().min(2, { message: "Le prénom doit contenir au moins 2 caractères." }),
    lastName: z.string().min(2, { message: "Le nom de famille doit contenir au moins 2 caractères." }),
    email: z.string().email({ message: "Veuillez entrer une adresse email valide." }),
    phone: z.string().optional(),
    role: z.nativeEnum(Role),
    type: z.nativeEnum(EmployeeType),
    departmentId: z.string().optional(),
    defaultPayRateId: z.string().optional(),
    salaireDeBase: z.string().optional(),
    numeroCNSS: z.string().optional(),
    numeroCIN: z.string().optional(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
}).refine(data => {
    // If a password is provided, confirmPassword must match.
    if (data.password) {
        return data.password === data.confirmPassword;
    }
    return true;
}, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
}).refine(data => {
    // If it's a new user (no id), a password is required.
    if (!data.id && !data.password) {
        return false;
    }
    return true;
}, {
    message: "Le mot de passe est requis pour un nouvel employé.",
    path: ["password"],
});

export type EmployeeFormData = z.infer<typeof employeeFormSchema>;