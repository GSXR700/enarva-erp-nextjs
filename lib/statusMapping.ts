// lib/StatusMapping.ts
import { LeadStatus } from "@prisma/client";

export const leadStatusMapping: { [key in LeadStatus]: { label: string; color: string } } = {
  // PHASE 1: Acquisition & Qualification
  new_lead: { label: "Nouveau", color: "bg-gray-200 text-gray-800" },
  to_qualify: { label: "À Qualifier", color: "bg-blue-100 text-blue-800" },
  waiting_info: { label: "En Attente d'Infos", color: "bg-yellow-100 text-yellow-800" },
  qualified: { label: "Qualifié", color: "bg-green-100 text-green-800" },

  // PHASE 2: Pré-vente / Devis
  visit_scheduled: { label: "Visite Planifiée", color: "bg-cyan-100 text-cyan-800" },
  visit_done: { label: "Visite Effectuée", color: "bg-cyan-200 text-cyan-900" },
  quote_sent: { label: "Devis Envoyé", color: "bg-indigo-100 text-indigo-800" },
  quote_accepted: { label: "Devis Accepté", color: "bg-green-200 text-green-900 font-semibold" },
  quote_refused: { label: "Devis Refusé", color: "bg-red-200 text-red-900" },

  // PHASE 3: Intervention & Livraison
  intervention_planned: { label: "Intervention Planifiée", color: "bg-purple-100 text-purple-800" },
  intervention_in_progress: { label: "Intervention en Cours", color: "bg-purple-200 text-purple-900 animate-pulse" },
  intervention_done: { label: "Intervention Terminée", color: "bg-purple-300 text-purple-900" },
  quality_control: { label: "Contrôle Qualité", color: "bg-amber-100 text-amber-800" },
  client_to_confirm_end: { label: "Attente Confirmation Client", color: "bg-amber-200 text-amber-900" },
  client_confirmed: { label: "Client a Confirmé", color: "bg-green-500 text-white font-semibold" },
  delivery_planned: { label: "Livraison Planifiée", color: "bg-blue-100 text-blue-900" },
  delivery_done: { label: "Livraison Effectuée", color: "bg-blue-200 text-blue-900" },
  signed_delivery_note: { label: "Bon de Livraison Signé", color: "bg-blue-300 text-blue-900 font-bold" },

  // PHASE 4: Paiement
  pending_payment: { label: "Paiement en Attente", color: "bg-orange-100 text-orange-800" },
  paid_official: { label: "Payé (Officiel)", color: "bg-green-300 text-green-900 font-bold" },
  paid_cash: { label: "Payé (Espèces)", color: "bg-green-300 text-green-900 font-bold" },
  refunded: { label: "Remboursé", color: "bg-red-200 text-red-900 italic" },
  pending_refund: { label: "Remboursement en Attente", color: "bg-red-100 text-red-900" },

  // PHASE 5: Suivi / SAV / Upsell
  follow_up_sent: { label: "Relance Envoyée", color: "bg-blue-200 text-blue-900" },
  upsell_in_progress: { label: "Upsell en Cours", color: "bg-pink-100 text-pink-800" },
  upsell_converted: { label: "Upsell Converti", color: "bg-pink-200 text-pink-900 font-bold" },
  rework_planned: { label: "Retouche Planifiée", color: "bg-yellow-200 text-yellow-900" },
  rework_done: { label: "Retouche Effectuée", color: "bg-yellow-300 text-yellow-900" },
  under_warranty: { label: "Sous Garantie", color: "bg-gray-100 text-gray-800" },
  after_sales_service: { label: "Service Après-Vente", color: "bg-gray-200 text-gray-900" },

  // PHASE 6: Problèmes / Anomalies
  client_issue: { label: "Litige Client", color: "bg-red-200 text-red-900 font-bold" },
  in_dispute: { label: "En Litige", color: "bg-red-300 text-red-900 font-bold" },
  client_paused: { label: "Client en Pause", color: "bg-yellow-200 text-yellow-900" },
  lead_lost: { label: "Lead Perdu", color: "bg-red-400 text-white" },
  canceled_by_client: { label: "Annulé par Client", color: "bg-red-300 text-white" },
  canceled_by_enarva: { label: "Annulé par Enarva", color: "bg-gray-300 text-gray-900" },
  internal_review: { label: "Révision Interne", color: "bg-gray-100 text-gray-800" },
  awaiting_parts: { label: "En Attente de Pièces", color: "bg-orange-100 text-orange-800" },

  // PHASE 7: Contrats / Sous-traitance
  contract_signed: { label: "Contrat Signé", color: "bg-emerald-200 text-emerald-900 font-bold" },
  under_contract: { label: "Sous Contrat", color: "bg-emerald-300 text-emerald-900 font-bold" },
  subcontracted: { label: "Sous-traité", color: "bg-gray-300 text-gray-900" },
  outsourced: { label: "Partiellement Externalisé", color: "bg-gray-200 text-gray-900" },
  waiting_third_party: { label: "En Attente Tiers", color: "bg-orange-200 text-orange-900" },

  // PHASE 8: Produits / Leads externes
  product_only: { label: "Produit Seulement", color: "bg-teal-100 text-teal-800" },
  product_supplier: { label: "Fournisseur Produit", color: "bg-teal-200 text-teal-900" },
  delivery_only: { label: "Livraison Simple", color: "bg-teal-300 text-teal-900" },
  affiliate_lead: { label: "Apporteur d'Affaires", color: "bg-pink-100 text-pink-800" },
  subcontractor_lead: { label: "Lead Sous-traitant", color: "bg-gray-300 text-gray-900" },
};