import { ACTOR_PROMPTS } from "../core/prompts.js";

export const architectActor = {
  type: "architect",
  label: "Architecte",
  systemPromptAdditions: ACTOR_PROMPTS.architect,
  allowedTools: ["get_delays", "get_budget_status", "get_pending_invoices", "generate_report", "get_marketplace", "send_notification"],
  proactiveRules: [
    { id: "new_project_opportunity", check: "new_project_matching_skills", message: "Un nouveau projet correspondant a votre profil vient d'etre publie." },
    { id: "deadline_reminder", check: "approaching_deadline", message: "Une echeance approche sur l'un de vos projets." },
  ],
};

export const enterpriseActor = {
  type: "enterprise",
  label: "Entreprise de construction",
  systemPromptAdditions: ACTOR_PROMPTS.enterprise,
  allowedTools: ["get_delays", "get_budget_status", "get_pending_invoices", "generate_report", "get_marketplace", "send_notification"],
  proactiveRules: [
    { id: "new_rfq", check: "new_rfq_available", message: "Un nouvel appel d'offres correspond a vos competences." },
    { id: "delay_alert", check: "project_delay_increasing", message: "Le retard sur l'un de vos chantiers s'aggrave." },
  ],
};

export const betActor = {
  type: "bet",
  label: "Bureau d'etudes techniques",
  systemPromptAdditions: ACTOR_PROMPTS.bet,
  allowedTools: ["get_delays", "get_budget_status", "get_pending_invoices", "generate_report", "send_notification"],
  proactiveRules: [
    { id: "compliance_check", check: "pending_compliance_review", message: "Un controle de conformite est en attente sur votre projet." },
  ],
};
