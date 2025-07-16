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

export const employeeFormSchema = z
  .object({
    id: z.string().optional(),
    firstName: z.string().trim().min(1, "Le prénom est requis"),
    lastName: z.string().trim().min(1, "Le nom est requis"),
    email: z.string().trim().email("L'adresse email n'est pas valide").toLowerCase(),
    phone: z.string()
      .trim()
      .regex(PHONE_REGEX, "Le numéro de téléphone doit être un numéro marocain valide")
      .optional()
      .nullable(),
    role: z.nativeEnum(Role).describe("Le rôle sélectionné n'est pas valide"),
    type: z.nativeEnum(EmployeeType).describe("Le type d'employé sélectionné n'est pas valide"),
    departmentId: z.string().min(1, "Le département est requis"),
    defaultPayRateId: z.string().optional().nullable(),
    salaireDeBase: z.string()
      .refine(
        (val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) > 0),
        "Le salaire de base doit être un nombre positif"
      )
      .optional()
      .nullable(),
    numeroCNSS: z.string()
      .trim()
      .regex(/^\d{8,}$/, "Le numéro CNSS doit contenir au moins 8 chiffres")
      .optional()
      .nullable(),
    numeroCIN: z.string()
      .trim()
      .regex(/^[A-Z]{1,2}\d{5,6}$/, "Le format du CIN n'est pas valide")
      .optional()
      .nullable(),
    password: z.string()
      .min(PASSWORD_MIN_LENGTH, `Le mot de passe doit faire au moins ${PASSWORD_MIN_LENGTH} caractères`)
      .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
      .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
      .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
      .optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Les mots de passe ne correspondent pas",
      path: ["confirmPassword"],
    }
  )
  .refine(
    (data) => !!data.id || !!data.password,
    {
      message: "Le mot de passe est requis pour un nouvel employé",
      path: ["password"],
    }
  );

export type EmployeeFormData = z.infer<typeof employeeFormSchema>;