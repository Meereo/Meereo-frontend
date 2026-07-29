import { ACTOR_PROMPTS } from "../core/prompts.js";

export const supplierActor = {
  type: "supplier",
  label: "Fournisseur",
  systemPromptAdditions: ACTOR_PROMPTS.supplier,
  allowedTools: ["get_pending_invoices", "get_budget_status", "get_marketplace"],
  proactiveRules: [
    { id: "product_demand", check: "high_product_demand", message: "Votre produit est recherche par de nombreux professionnels cette semaine." },
    { id: "invoice_status", check: "invoice_status_changed", message: "Le statut d'une de vos factures a change." },
  ],
};
