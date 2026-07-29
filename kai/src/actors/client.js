import { ACTOR_PROMPTS } from "../core/prompts.js";

export const clientActor = {
  type: "client",
  label: "Client / Maitre d'ouvrage",
  systemPromptAdditions: ACTOR_PROMPTS.client,
  allowedTools: ["get_delays", "get_budget_status", "get_pending_invoices", "generate_report", "get_marketplace", "send_notification"],
  proactiveRules: [
    { id: "no_professional", check: "project_has_no_professional", message: "Votre projet n'a aucun professionnel selectionne. Voulez-vous decouvrir les architectes disponibles ?" },
    { id: "budget_overrun", check: "budget_above_threshold", threshold: 85, message: "Votre budget risque d'etre depasse selon les dernieres estimations." },
    { id: "missing_document", check: "missing_required_document", message: "Un document obligatoire manque avant la prochaine etape." },
  ],
};
