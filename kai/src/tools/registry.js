export const TOOLS = [
  {
    type: "function",
    function: {
      name: "get_delays",
      description: "Liste les chantiers en retard et le nombre de jours de retard.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_budget_status",
      description: "Budget consomme par chantier, avec drapeau si au-dessus d'un seuil.",
      parameters: {
        type: "object",
        properties: { threshold: { type: "number", description: "Seuil en pourcentage (defaut 80)" } },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_pending_invoices",
      description: "Factures fournisseurs en attente, avec ecart vs bon de commande.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_report",
      description: "Synthese globale du portefeuille de chantiers.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_marketplace",
      description: "Liste les produits disponibles sur la marketplace MEEREO.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "send_notification",
      description: "Envoie une notification/message a un destinataire. Action engageante.",
      parameters: {
        type: "object",
        required: ["recipient", "body"],
        properties: {
          recipient: { type: "string", description: "vous | direction | compta | client | chef de projet" },
          subject: { type: "string" },
          body: { type: "string" },
        },
      },
    },
  },
];

/* Outils autorises par type d'acteur */
const ACTOR_TOOLS = {
  client:     ["get_delays", "get_budget_status", "get_pending_invoices", "generate_report", "get_marketplace", "send_notification"],
  architect:  ["get_delays", "get_budget_status", "get_pending_invoices", "generate_report", "get_marketplace", "send_notification"],
  enterprise: ["get_delays", "get_budget_status", "get_pending_invoices", "generate_report", "get_marketplace", "send_notification"],
  bet:        ["get_delays", "get_budget_status", "get_pending_invoices", "generate_report", "send_notification"],
  supplier:   ["get_pending_invoices", "get_budget_status", "get_marketplace"],
};

export function getToolsForActor(actorType) {
  const allowed = ACTOR_TOOLS[actorType] || ACTOR_TOOLS.client;
  return TOOLS.filter(t => allowed.includes(t.function.name));
}
